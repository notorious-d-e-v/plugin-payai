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
import { getCIDFromOrbitDbHash, prepareAgreement, verifyMessage, getCIDFromShortUrl } from '../utils.ts';

interface AgreementDetails {
    buyOfferCID: string;
    accept: boolean;
}


const extractOfferCIDTemplate = `
Analyze the following conversation to extract the CID of the Buy Offer from the buyer.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "buyOfferCID": "CID of the Buy Offer"
    }
}

If you found a short url like https://t.co/9dj1CQ98yG instead of a CID, then you can set that as the "buyOfferCID" field.
For example:
{
    "success": true,
    "result": {
        "buyOfferCID": "https://t.co/9dj1CQ98yG"
    }
}

If the buyer did not provide the CID of the Buy Offer nor a short url, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example:
{
    "success": false,
    "result": "Please provide the CID of the Buy Offer."
}

Only return a JSON markdown block.
`;

const successfulResponseToUserTemplate = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the buyer letting them know that you have accepted their offer.
Ask the buyer to fund the contract.
You should use your own words and style.
Don't tag the buyer in your response.
The response should be 260 characters or less.


Conversation:
{{recentMessages}}

Make sure to include the link of the agreement that you created so that the buyer can review it.
The link is https://ipfs.io/ipfs/{{agreementCID}}


For example:
{
    "success": true,
    "result": "A natural message informing the user that the offer has been accepted, asking them to fund the contract, and including the ipfs link to the agreement."
}

Return JSON markdown only.
`

const acceptOfferAction: Action = {
    name: "ACCEPT_OFFER",
    similes: ["AGREE_TO_OFFER", "ACCEPT_PROPOSAL", "ACCEPT_TERMS", "ACCEPT_BUY_OFFER"],
    description: "This action allows a seller to check a buy offer from a buyer and accept it on the PayAI marketplace.",
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

            const acceptOfferContext = composeContext({
                state,
                template: extractOfferCIDTemplate,
            });

            const extractedDetailsText = await generateText({
                runtime,
                context: acceptOfferContext,
                modelClass: ModelClass.LARGE,
            });

            elizaLogger.debug("extracted the following Buy Offer CID from the conversation:", extractedDetailsText);
            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDetailsText));

            // Validate offer details
            if (extractedDetails.success === false) {
                elizaLogger.info("Need more information from the user to accept the offer.");
                if (callback) {
                    callback({
                        text: `@${state.senderName} ${extractedDetails.result}`,
                        action: "ACCEPT_OFFER",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // if the url was shortened by a client like twitter, then follow the short url to get the CID
            if (extractedDetails.result.buyOfferCID.includes("t.co")) {
                const cid = await getCIDFromShortUrl(extractedDetails.result.buyOfferCID);
                extractedDetails.result.buyOfferCID = cid;
            }

            // analyze the buy offer to determine if it is valid
            const { isValid, reason } = await isValidBuyOffer(extractedDetails.result.buyOfferCID);
            if (!isValid) {
                elizaLogger.info(reason);
                if (callback) {
                    callback({
                        text: `@${state.senderName} ${reason}`,
                        action: "ACCEPT_OFFER",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // create an agreement
            const agreementDetails: AgreementDetails = {
                buyOfferCID: extractedDetails.result.buyOfferCID,
                accept: true,
            };

            // prepare the agreement message
            const agreement = await prepareAgreement(agreementDetails, runtime);

            // Publish the agreement to IPFS
            elizaLogger.debug("Publishing agreement to IPFS:", agreement);
            const result = await payAIClient.agreementsDB.put(agreement);
            const CID = getCIDFromOrbitDbHash(result);
            elizaLogger.info("Published Agreement to IPFS: ", CID);

            state.agreementCID = CID;
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
                        text: `@${state.senderName} ${successfulResponseToUser.result}`,
                        action: "ACCEPT_OFFER",
                        source: message.content.source,
                        agreement: agreementDetails,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                
                // send message to the user
                await callback(newMemory.content);
                await runtime.messageManager.createMemory(newMemory);
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in ACCEPT_OFFER handler:', error);
            console.error(error);
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Hey I've just made an offer for your service! You can see it here: https://ipfs.io/ipfs/bafyreie5jopsd22lrb5d46qgmytjobxs72lqopdkrayf6e3mvblwufld7m. Looking forward to working with you!",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I accept the offer. The Agreement's IPFS CID is bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
                    action: "ACCEPT_OFFER",
                },
            },
        ],
        // Example where the user provides a Buy Offer with an invalid signature
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Hey I've just made an offer for your service! You can see it here: https://ipfs.io/ipfs/bafyreie5jopsd22lrb5d46qgmytjobxs72lqopdkrayf6e3mvblwufld7m. Looking forward to working with you!",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Buy Offer signature is invalid.",
                    action: "ACCEPT_OFFER",
                },
            },
        ],
    ],
};

/*
 * Check if the Buy Offer is valid
 * This function verifies the Buy Offer and the Service Ad to ensure that the Buy Offer is valid in the eyes of the Seller Agent.
 * The function checks the signature of the Buy Offer, the existence of the Service Ad, and that the Service Ad matches the Seller's local Service Ad.
 */
async function isValidBuyOffer(buyOfferCID: string) {
    try {
        // get the buy offer from the buyOffersDB
        const buyOffer = (await payAIClient.getEntryFromCID(buyOfferCID, payAIClient.buyOffersDB)).payload.value;

        // verify the signature of the message using the identity
        const identity = buyOffer.identity;
        const signature = buyOffer.signature;
        const message = buyOffer.message;
        const isValidSignature = await verifyMessage(identity, signature, message);
        if (!isValidSignature) {
            return { isValid: false, reason: "Buy Offer signature is invalid." };
        }

        // look up the serviceAd that the buy offer references
        const serviceAd = await payAIClient.getEntryFromCID(message.serviceAdCID, payAIClient.serviceAdsDB);

        // verify that the serviceAd exists
        if (!serviceAd) {
            return { isValid: false, reason: "ServiceAd referenced by Buy Offer does not exist" };
        }

        // verify that the serviceAd is current by checking that it matches the seller's local service Ad
        const isCurrent = message.serviceAdCID === payAIClient.sellerServiceAdCID;
        if (!isCurrent) {
            return {
                isValid: false,
                reason: `ServiceAd does not match the seller's most recent service Ad. Seller's most recent service ad can be found at ${payAIClient.sellerServiceAdCID}`
            };
        }

        return { isValid: true, reason: "" };
    }
    catch (error) {
        console.error('Error validating Buy Offer:', error);
        throw error;
    }
}


export default acceptOfferAction;