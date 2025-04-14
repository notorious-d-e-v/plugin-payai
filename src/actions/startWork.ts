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
import { verifyMessage, getBase58PublicKey } from '../utils.ts';
import { JobDetails } from '../types.ts';

interface ContractDetails {
    transactionSignature: string;
}

const extractTransactionSignatureTemplate = `
Analyze the following conversation to extract the transaction signature of the contract.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "transactionSignature": "transaction signature of the contract"
    }
}

If the user did not provide the transaction signature, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the transaction signature, then return:
{
    "success": false,
    "result": "Please provide the transaction signature of the contract execution."
}

Only return a JSON markdown block.
`;

const startWorkAction: Action = {
    name: "START_WORK",
    similes: ["BEGIN_WORK", "START_WORK_FOR_CONTRACT", "BEGIN_WORK_FOR_CONTRACT"],
    description: "This action is used to start work by the seller agent after the buyer agent funds and starts the contract.",
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

            const startWorkContext = composeContext({
                state,
                template: extractTransactionSignatureTemplate,
            });

            const extractedDetailsText = await generateText({
                runtime,
                context: startWorkContext,
                modelClass: ModelClass.SMALL,
            });

            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDetailsText));

            // Validate transaction signature
            if (extractedDetails.success === false) {
                elizaLogger.info("Need more information from the user to start work.");
                if (callback) {
                    callback({
                        text: extractedDetails.result,
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // get the contract account from the transaction
            const contractAccount = await paymentClient.getContractAccountFromTransaction(extractedDetails.result.transactionSignature);
            if (!contractAccount) {
                elizaLogger.info("Could not find the contract account from the given transaction.");
                if (callback) {
                    callback({
                        text: "Could not find the contract account from the given transaction. Please verify the transaction signature.",
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }
            const contractAccountData = contractAccount.data;

            // fetch the agreement from the agreementsDB
            const agreement = (await payAIClient.getEntryFromCID(contractAccountData.cid, payAIClient.agreementsDB)).payload.value;

            // verify the signature of the agreement
            const isValidAgreement = await verifyMessage(agreement.identity, agreement.signature, agreement.message);
            if (!isValidAgreement) {
                elizaLogger.info("Agreement signature is invalid.");
                if (callback) {
                    callback({
                        text: "Agreement signature is invalid.",
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // verify that the identity that signed the agreement is the same as the local keypair
            const base58PublicKey = await getBase58PublicKey(runtime)
            if (agreement.identity !== base58PublicKey) {
                elizaLogger.info("The Agreement was not signed by my keypair.");
                if (callback) {
                    callback({
                        text: "Agreement was not signed by my keypair.",
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }
            
            
            // verify the signature of the buy offer
            const buyOffer = (await payAIClient.getEntryFromCID(agreement.message.buyOfferCID, payAIClient.buyOffersDB)).payload.value;
            const isValidBuyOffer = await verifyMessage(buyOffer.identity, buyOffer.signature, buyOffer.message);
            if (!isValidBuyOffer) {
                elizaLogger.info("Buy Offer signature is invalid.");
                if (callback) {
                    callback({
                        text: "Buy Offer signature is invalid.",
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // verify that the contract seller matches the wallet address of the service advertisement
            const serviceAd = (await payAIClient.getEntryFromCID(buyOffer.message.serviceAdCID, payAIClient.serviceAdsDB)).payload.value;
            if (contractAccountData.seller.toString() !== serviceAd.message.wallet) {
                elizaLogger.info("The seller's address in the contract does not match the wallet address of the service advertisement.");
                if (callback) {
                    callback({
                        text: `The seller's address in the contract (${contractAccountData.seller.toString()}) does not match the wallet address of the service advertisement (${serviceAd.message.wallet}).`,
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // verify the signature of the service advertisement
            const isValidServiceAd = await verifyMessage(serviceAd.identity, serviceAd.signature, serviceAd.message);
            if (!isValidServiceAd) {
                elizaLogger.info("Service Advertisement signature is invalid.");
                if (callback) {
                    callback({
                        text: "Service Advertisement signature is invalid.",
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // verify that the identity that signed the service ad is the same as the local keypair
            if (serviceAd.identity !== base58PublicKey) {
                elizaLogger.info("The Service Advertisement was not signed by my keypair.");
                if (callback) {
                    callback({
                        text: "Service Advertisement was not signed by my keypair.",
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // determine the total SOL needed to fund the contract
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

            // verify that the contract amount matches the expected amount
            if (contractAccountData.amount.toString() !== totalLamports) {
                elizaLogger.info("Contract amount does not match expected amount.");
                if (callback) {
                    callback({
                        text: `Contract amount (${contractAccountData.amount.toString()}) does not match expected amount (${totalLamports}).`,
                        action: "START_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // add the contract to the agent's current jobs
            const contractAddress = contractAccount.address.toString();
            let jobs: { [key: string]: string } = await runtime.cacheManager.get(`${message.agentId}-payai-contracts`);
            if (jobs === undefined) {
                jobs = {};
            }
            jobs[contractAddress] = contractAddress;
            await runtime.cacheManager.set(`${runtime.agentId}-payai-contracts`, jobs);
            
            // for debugging purposes, get the cache and log it
            const jobsFromCache = await runtime.cacheManager.get(`${runtime.agentId}-payai-contracts`);
            
            // store details about the contract in the agent's cache/db
            // which will later be used to start work and deliver work
            const jobDetails: JobDetails = {
                agreementCID: contractAccountData.cid,
                agreement: agreement.message,
                buyOfferCID: agreement.message.buyOfferCID,
                buyOffer: buyOffer.message,
                serviceAdCID: buyOffer.message.serviceAdCID,
                serviceAd: serviceAd.message,
                contractAddress: contractAccount.address,
                contractFundedAmount: totalLamports,
                contractBuyer: contractAccountData.buyer.toString(),
                contractSeller: contractAccountData.seller.toString(),
                contactInfo: {
                    client: state.recentMessagesData[0].content.source || message.content.source,
                    roomId: state.recentMessagesData[0].roomId || message.roomId,
                    handle: state.senderName || message.senderName,
                    conversationId: state.recentMessagesData[0].content.url || message.content.url,
                },
                elizaMessage: {
                    userId: message.userId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: message.content,
                },
                status: "NOT_STARTED",
            };
            const cacheKey = `${runtime.agentId}-payai-job-details-contract-${contractAccount.address}`;
            await runtime.cacheManager.set(cacheKey, jobDetails);

            // send message to the user
            // TODO: send a more natural response to the user using generateText
            let responseToUser = `Thanks for funding the contract. I will start work now!`;
            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: `@${state.senderName} ${responseToUser}`,
                        action: "START_WORK",
                        source: message.content.source,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                await runtime.messageManager.createMemory(newMemory);

                // send message to the user
                const callbackResponse = await callback(newMemory.content);
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in START_WORK handler:', error);
            console.error(error);
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I just started the contract in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully verified the contract. I will start work now.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I started the contract and funded it in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3. Feel free to check it out and start work.",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Got it, thanks! I will start work now.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I have funded the contract in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I couldn't find the contract account from the transaction. Please verify the transaction signature and send it to me again.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I have funded the contract in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "The Agreement you referenced in your contract was not signed by me. Please verify the contract and send me the transaction id again.",
                },
            },
        ]
    ],
};

export default startWorkAction;
