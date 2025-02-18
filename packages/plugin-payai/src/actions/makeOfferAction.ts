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
    parseJSONObjectFromText,
    getEmbeddingZeroVector,
} from '@elizaos/core';
import { payAIClient } from '../client';


interface OfferDetails {
    sellerServicesCID: string;
    desiredServiceID: string;
    desiredUnitAmount: string;
    wallet: string;
}


const extractOfferDetailsTemplate =
`Analyze the following conversation to extract Offer Details from a buyer to a seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found:
{
    "wallet": "Solana public key of the seller",
    "desiredServiceID": "ID of the service the buyer wants to purchase",
    "desiredUnitAmount": "Amount of units the buyer wants to purchase"
}

If the buyer provided the seller's identity or wallet in the conversation, then set the wallet field to equal the seller's identity or wallet.
If the buyer provided the service ID or amount of units in the conversation, then set the desiredServiceID or desiredUnitAmount fields to equal the service ID or amount of units.

Only return a JSON markdown block. Set the values of fields to empty strings if information was unclear.
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

            // if this action does not have all the required data, ask the user for it and return false

            const makeOfferContext = composeContext({
                state,
                template: extractOfferDetailsTemplate,
            });

            const extractedDetailsText = await generateText({
                runtime,
                context: makeOfferContext,
                modelClass: ModelClass.SMALL,
            });

            elizaLogger.debug("extracted the following Buy Offer details from the conversation:", extractedDetailsText);
            const extractedDetails = parseJSONObjectFromText(extractedDetailsText);

            // Validate offer details
            if (!extractedDetails.wallet || !extractedDetails.desiredServiceID || !extractedDetails.desiredUnitAmount) {
                elizaLogger.info("Need more information from the user to make an offer.");
                if (callback) {
                    callback({
                        text: "Please provide the seller's identity, the service ID, and the amount of units you want to purchase."
                    });
                }
                return false;
            }

            // use the seller's wallet id to get the seller's services CID
            const sellerServicesCIDs = await payAIClient
                .queryOrbitDbReturningCompleteEntries(
                    payAIClient.serviceAdsDB,
                    (doc: any) => {
                        return (doc.message.identity === extractedDetails.wallet);
                    }
                );
            elizaLogger.debug("Services provided by the desired seller: ", sellerServicesCIDs);
            if (sellerServicesCIDs.length === 0) {
                if (callback) {
                    callback({
                        text: "Could not find the seller's services. Please provide a valid seller's identity."
                    });
                }
                return false;
            }

            // create an offer
            const offerDetails: OfferDetails = {
                sellerServicesCID: sellerServicesCIDs[0].hash,
                desiredServiceID: extractedDetails.desiredServiceID,
                desiredUnitAmount: extractedDetails.desiredUnitAmount,
                wallet: extractedDetails.wallet,
            };

            // prepare the offer message
            const buyOffer = await payAIClient.prepareBuyOffer(offerDetails, runtime);

            // Publish the offer to IPFS
            elizaLogger.debug("Publishing buy offer to IPFS:", buyOffer);
            const result = await payAIClient.buyOffersDB.put(buyOffer);
            const CID = payAIClient.getCIDFromOrbitDbHash(result);
            elizaLogger.info("Published Buy Offer to IPFS: ", CID);

            // TODO Notify the seller agent of the offer using lib2p2 or other communication channels in the future

            let responseToUser = `Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${offerDetails.wallet}.`;
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
            if (callback) {
                callback({
                    text: "Error processing MAKE_OFFER request.",
                    error: "Error processing MAKE_OFFER request.",
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
                    text: "Successfully made an offer for ${offerDetails.desiredUnitAmount} units of service ID ${offerDetails.desiredServiceID} from seller ${offerDetails.wallet}.",
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
        ]
    ],
};

export default makeOfferAction;