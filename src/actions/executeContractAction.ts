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
import { verifyMessage, getBase58PublicKey, getCIDFromShortUrl, getCIDFromIpfsUrl } from '../utils.ts';

interface ContractDetails {
    agreementCID: string;
}

const extractAgreementCIDTemplate = `
Analyze the following conversation to extract the ipfs CID of the Agreement from the seller.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": {
        "agreementCID": "ipfs CID of the Agreement"
    }
}

If the seller provided a short url instead of the ipfs CID, then you should extract the short url and put it in the "agreementCID" field.
For example:
{
    "success": true,
    "result": {
        "agreementCID": "https://t.co/9dj1CQ98yG"
    }
}

If the seller did not provide the ipfs CID of the Agreement or a short url, then set the "success" field to false and set the result to a string asking the user to provide the missing information.
For example, if you could not find the ipfs CID of the Agreement, then return:
{
    "success": false,
    "result": "feedback message to the user"
}

Only return a JSON markdown block.
`;

const successfulResponseToUserTemplate = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Based on the conversation below, respond to the seller letting them know that you have funded the contract for them to start working on the service.
You should use your own words and style. Ask the user to start working on the service.
Don't tag the user in your response.
The response should be 260 characters or less.


Conversation:
{{recentMessages}}

Make sure to include the link of the transaction that funded the contract so that the seller can review.
The link is https://solscan.io/tx/{{tx}}


For example:
{
    "success": true,
    "result": "A natural message informing the user that the contract has been funded and that they can start working now, and the solscan link to the solana transaction."
}

Return JSON markdown only.
`;

const executeContractAction: Action = {
    name: "EXECUTE_CONTRACT",
    similes: ["START_ENGAGEMENT", "BEGIN_CONTRACT", "INITIATE_CONTRACT", "FUND_CONTRACT"],
    description: "This action allows a buyer to start the contract by sending funds to an escrow account on Solana. The seller will start working after the funds are sent.",
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
                modelClass: ModelClass.LARGE,
            });

            elizaLogger.debug("extracted the following Agreement CID from the conversation:", extractedDetailsText);
            const extractedDetails = JSON.parse(cleanJsonResponse(extractedDetailsText));

            // Validate agreement details
            if (extractedDetails.success === false) {
                elizaLogger.info("Need more information from the user to execute the contract.");
                if (callback) {
                    callback({
                        text: `@${state.senderName} ${extractedDetails.result}`,
                        action: "EXECUTE_CONTRACT",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // if the seller provided a short url because of a client like twitter
            // then follow the short url to get the CID
            if (extractedDetails.result.agreementCID.includes("t.co")) {
                const shortUrl = extractedDetails.result.agreementCID;
                const cid = await getCIDFromShortUrl(shortUrl);
                extractedDetails.result.agreementCID = cid;
            }

            if (extractedDetails.result.agreementCID.includes("ipfs.io")) {
                const cid = await getCIDFromIpfsUrl(extractedDetails.result.agreementCID);
                extractedDetails.result.agreementCID = cid;
            }


            // fetch the agreement from the agreementsDB
            const agreement = (await payAIClient.getEntryFromCID(extractedDetails.result.agreementCID, payAIClient.agreementsDB)).payload.value;

            // verify the signature of the agreement
            const isValidAgreement = await verifyMessage(agreement.identity, agreement.signature, agreement.message);
            if (!isValidAgreement) {
                elizaLogger.info("Agreement signature is invalid.");
                if (callback) {
                    callback({
                        text: `@${state.senderName} Agreement signature is invalid.`,
                        action: "EXECUTE_CONTRACT",
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
                        text: `@${state.senderName} Buy Offer signature is invalid.`,
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
                        text: `@${state.senderName} Buy Offer was not signed by my keypair.`,
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

            state.tx = tx;
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
                        action: "EXECUTE_CONTRACT",
                        source: message.content.source,
                        agreement: extractedDetails.result.agreementCID,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                
                // send message to the user
                await callback(newMemory.content);
                await runtime.messageManager.createMemory(newMemory);
            }

            // add the contract to the fundedContractsDB
            await payAIClient.fundedContractsDB.add(tx.toString());

            return true;
        } catch (error) {
            elizaLogger.error('Error in EXECUTE_CONTRACT handler:', error);
            console.error(error);
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I'm thrilled to let you know that I've accepted your offer You can review the agreement here: https://t.co/hEdbwgNnWS. Looking forward to collaborating on this project!",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Great! I checked it out and everything looks good. I just funded the contract. You can see the transaction here: https://solscan.io/tx/4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I'm thrilled to let you know that I've accepted your offer You can review the agreement here: https://t.co/dxtzIbMN24. Looking forward to collaborating on this project!",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Great! I checked it out and everything looks good. I just funded the contract. You can see the transaction here: https://solscan.io/tx/4vxNhiUKsUpYkJg42WBVA7wLacZwu2MT5ur8ETfpfrZHQuYFTdbu8PHSmAg1ft283LykP3RyLMEFWktzLCvzAjX3",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I'm thrilled to let you know that I've accepted your offer You can review the agreement here: https://t.co/dxtzIbMN24. Looking forward to collaborating on this project!",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I could not find anything with that CID. Please double check and provide it again.",
                },
            },
        ],
    ],
};

export default executeContractAction;