/*
 * When a Buyer Agent sees a service that they would like to purchase, they can make an offer to the Seller Agent.
 * The Buyer Agent publishes the offer to IPFS and then notifies the Seller Agent using lib2p2, or other communication channels in the future.
*/
import {
    IAgentRuntime,
    Memory,
    ModelClass,
    HandlerCallback,
    State,
    composeContext,
    elizaLogger,
    generateText,
    type Action,
    cleanJsonResponse,
    getEmbeddingZeroVector,
} from '@elizaos/core';
import { payAIClient } from '../clients/client.ts';
import { getCIDFromOrbitDbHash, prepareBuyOffer } from '../utils.ts';

interface OfferDetails {
    serviceAdCID: string;
    desiredServiceID: string;
    desiredUnitAmount: string;
    infoFromBuyer: string;
}

const extractOfferDetailsTemplate = `
Analyze the Conversation below to extract Offer Details from a buyer to a seller.
Offer Details have this schema when successful:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "desiredServiceID": "ID of the service the buyer wants to purchase or 0 if not provided",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase or 1 if not provided",
        "infoFromBuyer": "Any additional details that the buyer needs to provide to the seller to complete the service or empty string if not provided"
}

Offer Details have this schema when unsuccessful:
{
    "success": false,
    "result": "feedback message"
}

Conversation:
{{recentMessages}}


Return a JSON object containing the following fields.
For example:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "desiredServiceID": "ID of the service the buyer wants to purchase or 0 if not provided",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase or 1 if not provided",
        "infoFromBuyer": "Any additional details that the buyer needs to provide to the seller to complete the service or empty string if not provided"
    }
}

If the buyer provided the service ID then set the desiredServiceID to the service ID. Otherwise set the desiredServiceID to "0" if not provided.
If the buyer provided the amount of units then set the desiredUnitAmount to the amount of units. Otherwise set the desiredUnitAmount to "1" if not provided.
If the buyer provided the seller's service ad CID in the conversation, then set the serviceAdCID to the CID.
If the buyer provided the seller with any additional details in the conversation, then set the infoFromBuyer to the additional details.

If not all information could be determined from the conversation and from your instructions, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example:
{
    "success": false,
    "result": "Natural language asking for the missing information."
}

Only return a JSON markdown block.
`;

const successfulResponseToUserTemplate = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the seller letting them know that you have made an offer for their service, and ask them to accept it and sign an agreement.
You should use your own words and style.
The response should be 260 characters or less.

Conversation:
{{recentMessages}}


Make sure to include the @username of the seller and the link of the buy offer that you created so that the seller can check it out.
The link is https://ipfs.io/ipfs/{{buyOfferCID}}


For example:
{
    "success": true,
    "result": "A natural message tagging the seller and informing them that the offer has been made, and the ipfs link to the buy offer."
}

Return JSON markdown only.
`

const makeOfferAction: Action = {
    name: "MAKE_OFFER",
    similes: ["PURCHASE_SERVICE", "BUY_SERVICE", "HIRE_AGENT", "MAKE_PROPOSAL"],
    description: "Make an offer to purchase a service from a seller on the PayAI marketplace.",
    suppressInitialMessage: true,
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        try {
            if (!state) {
                // Initialize or update state
                state = (await runtime.composeState(message)) as State;
            } else {
                state = await runtime.updateRecentMessageState(state);
            }

            const makeOfferContext = composeContext({
                state,
                template: extractOfferDetailsTemplate,
            });

            const extractedDetailsText = await generateText({
                runtime,
                context: makeOfferContext,
                modelClass: ModelClass.LARGE,
            });

            elizaLogger.debug("extractedDetailsText:", extractedDetailsText);
            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDetailsText));
            elizaLogger.debug("extractedDetails:", extractedDetails);

            // Validate offer details
            if (extractedDetails.success === false) {
                elizaLogger.info("Need more information from the user to make an offer.");
                if (callback) {
                    callback({
                        text: `@${state.senderName} ${extractedDetails.result}`,
                        action: "MAKE_OFFER",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // create an offer
            const offerDetails: OfferDetails = {
                serviceAdCID: extractedDetails.result.serviceAdCID,
                desiredServiceID: extractedDetails.result.desiredServiceID || "0",
                desiredUnitAmount: extractedDetails.result.desiredUnitAmount || "1",
                infoFromBuyer: extractedDetails.result.infoFromBuyer
            };

            // prepare the offer message
            const buyOffer = await prepareBuyOffer(offerDetails, runtime);

            // Publish the offer to IPFS
            elizaLogger.debug("Publishing buy offer to IPFS:", buyOffer);
            const result = await payAIClient.buyOffersDB.put(buyOffer);
            const CID = getCIDFromOrbitDbHash(result);
            elizaLogger.info("Published Buy Offer to IPFS: ", CID);

            // TODO Notify the seller agent of the offer using lib2p2 or other communication channels in the future

            state.buyOfferCID = CID;
            const successfulResponseToUserContext = composeContext({
                state,
                template: successfulResponseToUserTemplate,
            });

            const successfulResponseToUserText = await generateText({
                runtime,
                context: successfulResponseToUserContext,
                modelClass: ModelClass.LARGE,
            });

            const successfulResponseToUser = JSON.parse(cleanJsonResponse(successfulResponseToUserText));
            elizaLogger.debug("Successful response to user:", successfulResponseToUser.result);

            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: `${successfulResponseToUser.result}`,
                        action: "MAKE_OFFER",
                        source: message.content.source,
                    },
                    embedding: getEmbeddingZeroVector()
                };

                // send message to the user
                await callback(newMemory.content);
                await runtime.messageManager.createMemory(newMemory);
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in MAKE_OFFER handler:', error);
            console.error(error);
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to purchase 5 units of service ID 1 from seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U"
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully made an offer for to the seller. Your Buy Offer's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                    action: "MAKE_OFFER"
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to purchase service with CID."
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Please provide the service ad CID",
                    action: "MAKE_OFFER"
                },
            }
        ],
    ],
};

export default makeOfferAction;