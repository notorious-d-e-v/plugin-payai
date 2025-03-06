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
import { getCIDFromOrbitDbHash, prepareBuyOffer, queryOrbitDbReturningCompleteEntries } from '../utils.ts';

interface OfferDetails {
    serviceAdCID: string;
    desiredServiceID: string;
    desiredUnitAmount: string;
}

const extractOfferDetailsTemplate = `
Analyze the Conversation below to extract Offer Details from a buyer to a seller.
Offer Details have this schema when successful:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "wallet": "Solana public key of the seller",
        "desiredServiceID": "ID of the service the buyer wants to purchase",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase"
}

Offer Details have this schema when unsuccessful:
{
    "success": false,
    "result": "feedback message"
}

Conversation:
{{recentMessages}}


Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "serviceAdCID": "hash of the seller's services",
        "wallet": "Solana public key of the seller",
        "desiredServiceID": "ID of the service the buyer wants to purchase",
        "desiredUnitAmount": "Amount of units the buyer wants to purchase"
    }
}

If the buyer provided the seller's identity or wallet in the conversation, then set the wallet field to equal the seller's identity or wallet.
If the buyer provided the service ID or amount of units in the conversation, then set the desiredServiceID or desiredUnitAmount fields to equal the service ID or amount of units.
If the buyer provided the seller's service ad CID in the conversation, then set the serviceAdCID field to equal the seller's service ad CID.

If not all information was provided, or the information was unclear, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could only find the seller's wallet or identity, then return:
{
    "success": false,
    "result": "Please provide the service ID, and the amount of units you want to purchase."
}

Make sure you recognize when a user is asking to purchase a new service.
If you see in the message history that you recently created a purchase order for a user, and now they are asking for a new service, then you should forget the previous order that they created and help them create a new purchase order for a new service.

Only return a JSON markdown block.
`;

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
                modelClass: ModelClass.SMALL,
            });

            elizaLogger.debug("extractedDetailsText:", extractedDetailsText);
            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDetailsText));
            elizaLogger.debug("extractedDetails:", extractedDetails);

            // Validate offer details
            if (extractedDetails.success === false || extractedDetails.success === "false") {
                elizaLogger.info("Need more information from the user to make an offer.");
                if (callback) {
                    callback({
                        text: extractedDetails.result,
                        action: "MAKE_OFFER",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // create an offer
            const offerDetails: OfferDetails = {
                serviceAdCID: extractedDetails.result.serviceAdCID,
                desiredServiceID: extractedDetails.result.desiredServiceID,
                desiredUnitAmount: extractedDetails.result.desiredUnitAmount
            };

            // prepare the offer message
            const buyOffer = await prepareBuyOffer(offerDetails, runtime);

            // Publish the offer to IPFS
            elizaLogger.debug("Publishing buy offer to IPFS:", buyOffer);
            const result = await payAIClient.buyOffersDB.put(buyOffer);
            const CID = getCIDFromOrbitDbHash(result);
            elizaLogger.info("Published Buy Offer to IPFS: ", CID);

            // TODO Notify the seller agent of the offer using lib2p2 or other communication channels in the future

            let responseToUser = `Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}.`;
            responseToUser += `\nYour Buy Offer's IPFS CID is ${CID}`;

            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: responseToUser,
                        action: "MAKE_OFFER",
                        source: message.content.source,
                        buyOffer: offerDetails,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                await runtime.messageManager.createMemory(newMemory);

                // send message to the user
                callback(newMemory.content);
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in MAKE_OFFER handler:', error);
            console.error(error);
            if (callback) {
                callback({
                    text: "Error processing MAKE_OFFER request.",
                    action: "MAKE_OFFER",
                    source: message.content.source,
                });
            }
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
                    text: "Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${extractedDetails.result.wallet}. Your Buy Offer's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                    action: "MAKE_OFFER"
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to purchase 3 units of service ID 2."
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
                    action: "MAKE_OFFER"
                },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to purchase service ID 1."
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
                    action: "MAKE_OFFER"
                },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to purchase seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U"
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase.",
                    action: "MAKE_OFFER"
                },
            }
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to purchase 5 units of service ID 1 from seller 9ovkK7WoiSXyEJDM5cZG3or3W95bdzZLDDHhuMgSJT9U",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Please provide the serviceAdCID of the seller's services.",
                    action: "MAKE_OFFER"
                },
            },
        ]
    ],
};

export default makeOfferAction;