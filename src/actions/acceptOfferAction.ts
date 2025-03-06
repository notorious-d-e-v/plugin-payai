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
import { verifySignature } from '@solana/web3.js';
import { payAIClient } from '../clients/client.ts';
import { getCIDFromOrbitDbHash, prepareAgreement, queryOrbitDbReturningCompleteEntries, verifyMessage } from '../utils';

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

If the buyer did not provide the CID of the Buy Offer, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the CID of the Buy Offer, then return:
{
    "success": false,
    "result": "Please provide the CID of the Buy Offer."
}

Only return a JSON markdown block.
`;

const acceptOfferAction: Action = {
    name: "ACCEPT_OFFER",
    similes: ["AGREE_TO_OFFER", "ACCEPT_PROPOSAL", "ACCEPT_TERMS", "ACCEPT_BUY_OFFER"],
    description: "This action allows a seller to accept an offer from a buyer on the PayAI marketplace.",
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
                modelClass: ModelClass.SMALL,
            });

            elizaLogger.debug("extracted the following Buy Offer CID from the conversation:", extractedDetailsText);
            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDetailsText));

            // Validate offer details
            if (extractedDetails.success === false || extractedDetails.success === "false") {
                elizaLogger.info("Need more information from the user to accept the offer.");
                if (callback) {
                    callback({
                        text: extractedDetails.result,
                        action: "ACCEPT_OFFER",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // analyze the buy offer to determine if it is valid
            const { isValid, reason } = await isValidBuyOffer(extractedDetails.result.buyOfferCID, runtime);
            if (!isValid) {
                elizaLogger.info(reason);
                if (callback) {
                    callback({
                        text: reason,
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

            // TODO Notify the buyer agent of the agreement using lib2p2 or other communication channels in the future
            let responseToUser = `I accepted the offer and signed an agreement. The Agreement's IPFS CID is ${CID}`;

            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: responseToUser,
                        action: "ACCEPT_OFFER",
                        source: message.content.source,
                        agreement: agreementDetails,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                await runtime.messageManager.createMemory(newMemory);

                // send message to the user
                callback(newMemory.content);
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in ACCEPT_OFFER handler:', error);
            console.error(error);
            if (callback) {
                callback({
                    text: "Error processing ACCEPT_OFFER request.",
                    action: "ACCEPT_OFFER",
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
                    text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
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
                    text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
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
        // Example where the user provides a Buy Offer that references a non-existent Service Ad
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "ServiceAd referenced by Buy Offer does not exist",
                    action: "ACCEPT_OFFER",
                },
            },
        ],
        // Example where the user provides a Buy Offer that references a Service Ad that does not match the seller's most recent Service Ad
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I sent you a buy offer with CID bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "ServiceAd does not match the seller's most recent service Ad. Seller's most recent service ad can be found at bafybeibml5uieyxa5tufngvg7fgwbkwvlsuntwbxgtskoqynbt7wlchmfm",
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
async function isValidBuyOffer(buyOfferCID: string, runtime: IAgentRuntime) {
    try {
        // get the buy offer from the buyOffersDB
        const buyOffer = (await payAIClient.getEntryFromCID(buyOfferCID, payAIClient.buyOffersDB)).payload.value;;

        // verify the signature of the message using the identity
        const identity = buyOffer.identity;
        const signature = buyOffer.signature;
        const message = buyOffer.message;
        const isValidSignature = await verifyMessage(identity, signature, message);
        if (!isValidSignature) {
            return { isValid: false, reason: "Buy Offer signature is invalid." };
        }

        // look up the serviceAd that the buy offer references
        const serviceAd = await payAIClient.getEntryFromHash(message.serviceAdCID, payAIClient.serviceAdsDB);

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