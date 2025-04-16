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
import { Account, Address } from '@solana/web3.js';
import { Contract } from '../generated/accounts/contract.ts';
import { payAIClient } from '../clients/client.ts';
import { paymentClient } from '../payment.ts';
import { verifyMessage, getBase58PublicKey, getTwitterClientFromRuntime } from '../utils.ts';
import { JobDetails } from '../types.ts';

interface ContractDetails {
    transactionSignature: string;
}

const extractDeliveredWorkTemplate = `
Analyze the following conversation to extract a link of the work that the seller has delivered.
I need to review the work before I can release the funds to the seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "deliveredWorkLink": "link containing the delivered work to be reviewed"
    }
}

If the user did not provide the delivery link, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the delivery link, then return:
{
    "success": false,
    "result": "Please provide a link of your work."
}

Only return a JSON markdown block.
`;

const extractTransactionSignatureTemplate = `
Analyze the following conversation to extract the transaction signature of the contract that funded the work.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "transactionSignature": "transaction signature of the contract that funded the work"
    }
}

If you cannot find the transaction signature in the conversation, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the transaction signature, then return:
{
    "success": false,
    "result": "Please provide the transaction signature of the contract execution that funded the work."
}

Only return a JSON markdown block.
`;

const reviewWorkTemplate = `
You are the buyer in a contract with a seller.
You have received the work that the seller has delivered.
You need to review the work to determine if the seller has delivered the work as promised in the contract.

Here is the work that the seller has delivered:

{{deliveredWorkText}}

Here is the seller's advertised service:

{{serviceAdText}}

Based on the work and the service advertisement, please determine if the delivered work is satisfactory.

Return a JSON object containing your assessment.
For example:
{
    "success": true,
    "result": {
        "satisfactory": true
    }
}

If the work is not satisfactory, then set the "success" field to false, and set the "result" field to a string explaining why the work is not satisfactory.
For example, if the work is not satisfactory, then return:
{
    "success": false,
    "result": "the reason goes here"
}

Only return a JSON markdown block.
`;


const reviewWorkAction: Action = {
    name: "REVIEW_WORK",
    similes: ["REVIEW_DELIVERY", "REVIEW_DELIVERED_WORK", "CHECK_WORK", "CHECK_DELIVERED_WORK", "RELEASE_FUNDS", "PAY_SELLER"],
    description: "This action is used to review the work that the seller has delivered, and release the funds to the seller if the work is satisfactory.",
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
            console.log("REVIEW_WORK message: ");
            console.dir(message, { depth: null });
            console.log("REVIEW_WORK state: ");
            console.dir(state, { depth: null });

            // read the recent messages to get the transaction signature that funded the contract
            const transactionSignatureContext = composeContext({
                state,
                template: extractTransactionSignatureTemplate,
            });

            const extractedSignatureText = await generateText({
                runtime,
                context: transactionSignatureContext,
                modelClass: ModelClass.SMALL,
            });

            const extractedSignature = JSON.parse(cleanJsonResponse(extractedSignatureText));

            // validate parsing the transaction signature
            if (extractedSignature.success === false) {
                elizaLogger.info("Need more information from the user to review the work.", extractedSignature.result);
                if (callback) {
                    callback({
                        text: `@${state.senderName} ${extractedSignature.result}`,
                        action: "REVIEW_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            console.log("EXTRACTED SIGNATURE: ");
            console.dir(extractedSignature, { depth: null });

            // validate the contract and all related documents
            const validationResult = await validateContract(
                runtime,
                extractedSignature.result.transactionSignature,
                callback,
                message,
            );
            if (!validationResult || !validationResult.success) {
                return false;
            }
            console.log("VALIDATION RESULT: ");
            console.dir(validationResult, { depth: null });

            const extractDeliveredWorkContext = composeContext({
                state,
                template: extractDeliveredWorkTemplate,
            });

            const extractedDeliveredWorkText = await generateText({
                runtime,
                context: extractDeliveredWorkContext,
                modelClass: ModelClass.SMALL,
            });

            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDeliveredWorkText));

            if (extractedDetails.success === false) {
                elizaLogger.info("Need more information from the user to review the work. ", extractedDetails.result);
                if (callback) {
                    callback({
                        text: `@${state.senderName} ${extractedDetails.result}`,
                    });
                }
                return false;
            }

            // TODO: follow the link and review the work
            // if the link is a tweet with a link in it, then parse the link from the tweet
            console.log("EXTRACTED DETAILS: ");
            console.dir(extractedDetails, { depth: null });
            const shortUrl = extractedDetails.result.deliveredWorkLink;
            console.log("SHORT URL: ", shortUrl);

            // follow the twitter short link to get the full link
            const fullUrl = await getFullLink(shortUrl);
            console.log("FULL URL: ", fullUrl);

            // now use the twitter client to get the full tweet thread
            // and compile the entire text of the tweet thread
            const twitterClient = await getTwitterClientFromRuntime(runtime);
            const { conversationId, username } = getConversationIdAndUsername(fullUrl);
            console.log("CONVERSATION ID: ", conversationId);
            console.log("USERNAME: ", username);
            const rootTweet = await twitterClient.client.getTweet(conversationId);
            console.log("ROOT TWEET: ");
            console.dir(rootTweet, { depth: null });
            const query = `conversation_id:${conversationId} from:${username}`;
            const threadTweets = await twitterClient.client.fetchSearchTweets(query, 100);
            console.log("THREAD TWEETS: ");
            console.dir(threadTweets, { depth: null });

            // sort the tweets in order by the tweet id
            let sortedTweets = [rootTweet];
            // sort the threadtweets and append them to the sortedTweets
            threadTweets.tweets.sort((a, b) => a.id - b.id);
            sortedTweets.push(...threadTweets.tweets); 
            console.log("SORTED TWEETS: ");
            console.dir(sortedTweets, { depth: null });

            // compile the entire text of the tweet thread
            let tweetText = "";
            for (const tweet of sortedTweets) {
                tweetText += tweet.text + "\n\n";
            }
            console.log("FULL TWEET TEXT: ", tweetText);

            const desiredServiceID = parseInt(validationResult.buyOffer.message.desiredServiceID);

            // loop through the services in serviceAd.message.services and find the one with the matching id
            const serviceAdDescription = validationResult.serviceAd.message.services.find((service: any) => service.id === desiredServiceID)?.description;
            console.log("SERVICE AD DESCRIPTION: ", serviceAdDescription);

            // to review the work, send the delivered work along with the description of the service
            // in the service advertisement and the request for the work in the buy offer
            state.deliveredWorkText = tweetText;
            // TODO: change this to use the actual service advertisement and buy offer
            state.serviceAdText = serviceAdDescription;
            const reviewWorkContext = composeContext({
                state,
                template: reviewWorkTemplate,
            });

            const reviewWorkText = await generateText({
                runtime,
                context: reviewWorkContext,
                modelClass: ModelClass.LARGE,
            });

            const reviewWorkResult = JSON.parse(cleanJsonResponse(reviewWorkText));
            console.log("REVIEW WORK RESULT: ");
            console.dir(reviewWorkResult, { depth: null });

            if (reviewWorkResult.success === false) {
                elizaLogger.info("The work is not satisfactory. ", reviewWorkResult.result);
                if (callback) {
                    callback({
                        text: `@${state.senderName} ${reviewWorkResult.result}`,
                        action: "REVIEW_WORK",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // release the funds to the seller
            const contractAccountAddress = validationResult.contractAccount.address;
            const seller = validationResult.contractAccount.data.seller.toString();

            const tx = await paymentClient.releasePayment(contractAccountAddress, seller);
            console.log("TX: ", tx);

            let responseToUser = `@${state.senderName} The work has been reviewed and found to be satisfactory. The funds have been released to you in transaction https://solscan.io/tx/${tx}.`;

            if (callback) {
                callback({
                    text: responseToUser,
                    action: "REVIEW_WORK",
                    source: message.content.source,
                });
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in REVIEW_WORK handler:', error);
            console.error(error);
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I finished working on our contract. Here is the link to the work: https://t.co/9dj1CQ98yG",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Thanks for sending, I will review the work now and release the funds to you if it is satisfactory.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I finished working on our contract. Here is the link to the work: https://t.co/9dj1CQ98yG",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Thanks! I just reviewed the work and everything looks good. I released the payment to you in transaction 4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3. Feel free to check it out.",
                },
            },
        ],        
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I finished working on our contract. Here is the link to the work: https://t.co/9dj1CQ98yG",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "The contract that you mentioned was not funded by me. Please verify the transaction signature and send it to me again.",
                },
            },
        ],
    ],
};


async function validateContract(
    runtime: IAgentRuntime,
    transactionSignature: string,
    callback: HandlerCallback,
    message: Memory,
): Promise<false | {
    success: boolean,
    contractAccount: Account<Contract, Address>,
    agreement: any,
    buyOffer: any,
    serviceAd: any
}> {
    // get the contract account from the transaction
    const contractAccount = await paymentClient.getContractAccountFromTransaction(transactionSignature);
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

    // check if the payment has already been released
    const paymentReleased = contractAccountData.isReleased;
    if (paymentReleased) {
        elizaLogger.info("The payment has already been released for contract account: ", contractAccount.address);
        if (callback) {
            callback({
                text: `The payment has already been released for contract account: ${contractAccount.address}. Please check the contract on https://solscan.io/account/${contractAccount.address} to verify the payment.`,
                action: "REVIEW_WORK",
                source: message.content.source,
            });
        }
        return false;
    }

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

    // verify that the identity that signed the agreement is the same as seller's wallet address
    const base58PublicKey = await getBase58PublicKey(runtime)
    if (agreement.identity !== contractAccountData.seller.toString()) {
        elizaLogger.info("The Agreement was not signed by the seller's wallet address.");
        if (callback) {
            callback({
                text: "Agreement was not signed by the seller's wallet address.",
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
    // verify that the buy offer's identity matches the local keypair
    if (buyOffer.identity !== base58PublicKey) {
        elizaLogger.info("The Buy Offer was not signed by my keypair.");
        if (callback) {
            callback({
                text: "Buy Offer was not signed by my keypair.",
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

    return {
        success: true,
        contractAccount,
        agreement,
        buyOffer,
        serviceAd,
    };
}

async function getFullLink(shortUrl: string) {
    const response = await fetch(shortUrl);
    console.dir(response, { depth: 3 });
    return response.url;
}

function getConversationIdAndUsername(fullUrl: string) {
    const url = new URL(fullUrl);
    // https://x.com/jowettbrendan/status/1911337581805208061
    // the username is jowettbrendan and the conversation id is 1911337581805208061
    const conversationId = url.pathname.split('/')[3];
    const username = url.pathname.split('/')[1];
    return { conversationId, username };
}

export default reviewWorkAction;