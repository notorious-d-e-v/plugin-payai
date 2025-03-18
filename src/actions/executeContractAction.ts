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
import { paymentClient } from '../payment.ts';
import { verifyMessage, getSolanaKeypair, getBase58PublicKeyFromCryptoKey, getBase58PublicKey } from '../utils.ts';

interface ContractDetails {
    agreementCID: string;
}

const extractAgreementCIDTemplate = `
Analyze the following conversation to extract the CID of the Agreement from the seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "agreementCID": "CID of the Agreement"
    }
}

If the seller did not provide the CID of the Agreement, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the CID of the Agreement, then return:
{
    "success": false,
    "result": "Please provide the CID of the Agreement."
}

Only return a JSON markdown block.
`;

const executeContractAction: Action = {
    name: "EXECUTE_CONTRACT",
    similes: ["START_ENGAGEMENT", "BEGIN_CONTRACT", "INITIATE_CONTRACT"],
    description: "This action allows a buyer to start the contract by sending funds to an escrow account on Solana.",
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

            const executeContractContext = composeContext({
                state,
                template: extractAgreementCIDTemplate,
            });

            const extractedDetailsText = await generateText({
                runtime,
                context: executeContractContext,
                modelClass: ModelClass.SMALL,
            });

            elizaLogger.debug("extracted the following Agreement CID from the conversation:", extractedDetailsText);
            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDetailsText));

            // Validate agreement details
            if (extractedDetails.success === false || extractedDetails.success === "false") {
                elizaLogger.info("Need more information from the user to execute the contract.");
                if (callback) {
                    callback({
                        text: extractedDetails.result,
                        action: "EXECUTE_CONTRACT",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // fetch the agreement from the agreementsDB
            const agreement = (await payAIClient.getEntryFromCID(extractedDetails.result.agreementCID, payAIClient.agreementsDB)).payload.value;;

            // verify the signature of the agreement
            const isValidAgreement = await verifyMessage(agreement.identity, agreement.signature, agreement.message);
            if (!isValidAgreement) {
                elizaLogger.info("Agreement signature is invalid.");
                if (callback) {
                    callback({
                        text: "Agreement signature is invalid.",
                        action: "EXECUTE_CONTRACT",
                        source: message.content.source,
                    });
                }
                return false;
            }
            
            // verify the signature of the buy offer
            const buyOffer = (await payAIClient.getEntryFromCID(agreement.message.buyOfferCID, payAIClient.buyOffersDB)).payload.value;;
            const isValidBuyOffer = await verifyMessage(buyOffer.identity, buyOffer.signature, buyOffer.message);
            if (!isValidBuyOffer) {
                elizaLogger.info("Buy Offer signature is invalid.");
                if (callback) {
                    callback({
                        text: "Buy Offer signature is invalid.",
                        action: "EXECUTE_CONTRACT",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // verify that the identity that signed the buy offer is the same as the local keypair
            const base58PublicKey = await getBase58PublicKey(runtime)
            if (buyOffer.identity !== base58PublicKey) {
                elizaLogger.info("The Buy Offer that this Agreement references was not signed by my keypair.");
                if (callback) {
                    callback({
                        text: "Buy Offer was not signed by my keypair.",
                        action: "EXECUTE_CONTRACT",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // determine the total SOL needed to fund the contract
            const serviceAd = (await payAIClient.getEntryFromCID(buyOffer.message.serviceAdCID, payAIClient.serviceAdsDB)).payload.value;
            const priceString = serviceAd.message.services[parseInt(buyOffer.message.desiredServiceID)].price;
            const priceMatch = priceString.match(/(\d+\.?\d*)/);
            if (!priceMatch) {
                throw new Error(`Could not extract price from string: ${priceString}`);
            }
            const priceInSOL = parseFloat(priceString);
            const units = parseInt(buyOffer.message.desiredUnitAmount);
            const totalSOL = priceInSOL * units;

            // convert SOL to lamports (1 SOL = 1 billion lamports)
            const lamportsPerSOL = 1_000_000_000;
            const totalLamports = Math.round(totalSOL * lamportsPerSOL).toString();

            // start the contract on Solana
            const tx = await paymentClient.startContract(extractedDetails.result.agreementCID, agreement.identity, totalLamports);

            let responseToUser = `Successfully started the contract. You can see the transaction at https://solscan.io/tx/${tx}`;

            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: responseToUser,
                        action: "EXECUTE_CONTRACT",
                        source: message.content.source,
                        agreement: extractedDetails.result.agreementCID,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                await runtime.messageManager.createMemory(newMemory);

                // send message to the user
                callback(newMemory.content);
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in EXECUTE_CONTRACT handler:', error);
            console.error(error);
            if (callback) {
                callback({
                    text: "Error processing EXECUTE_CONTRACT request.",
                    action: "EXECUTE_CONTRACT",
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
                    text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Great! I checked it out and everything looks good. I just started the contract. You can see the transaction here: https://solscan.io/tx/4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I could not find anything with that CID. Please double check and provide it again.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Agreement signature is invalid.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I have signed an agreement with CID bafybeihdwdcojee6xedzdetojuzjevtenxquvykuefgh4dqkjv67uzcmw7",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "The signature of the Buy Offer that this Agreement references is invalid.",
                },
            },
        ]
    ],
};

export default executeContractAction;