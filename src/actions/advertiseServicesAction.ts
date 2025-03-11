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
    getEmbeddingZeroVector,
    cleanJsonResponse,
} from '@elizaos/core';
import fs from 'fs';
import { payAIClient } from '../clients/client.ts';
import { prepareServiceAd, getCIDFromOrbitDbHash, queryOrbitDbReturningCompleteEntries, getAllDbEntriesWithCIDs } from '../utils.ts';



const extractServicesTemplate = `
Analyze the following conversation to extract the services that the user wants to sell.
There could be multiple services, so make sure you extract all of them.

Return a JSON object containing only the fields where information was clearly found.

For example:
{
    "success": true,
    "result": [
        {
            "name": "Service Name",
            "description": "Service Description",
            "price": "Service Price"
        }
    ]
}

If the user did not provide enough information for any of the fields, then set the "success" field to false and set the result to a string asking the user to provide the missing information. 
Be natural and polite when asking for missing information.
For example, if you could not find the services, then return:
{
    "success": false,
    "result": "feedback message"
}

The conversation is below

{{recentMessages}}

Only return a JSON mardown block.
`;


const advertiseServicesAction: Action = {
    name: "SELL_SERVICES",
    similes: ["ADVERTISE_SERVICES", "OFFER_SERVICES", "LIST_SERVICES"],
    description: "Ask the user for the services they want to sell, create the services file locally, and publish it to the serviceAdsDB.",
    suppressInitialMessage: true,
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        if (message.content.source !== "direct") {
            elizaLogger.debug("SELL_SERVICES action is only allowed when interacting with the direct client. This message was from:", message.content.source);
            return false;
        }
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

            // Extract the services from the message history
            const extractServicesContext = composeContext({
                state,
                template: extractServicesTemplate,
            });

            const extractedServicesText = await generateText({
                runtime,
                context: extractServicesContext,
                modelClass: ModelClass.SMALL,
            });

            elizaLogger.debug("extracted services from generateText:", extractedServicesText);
            const extractedServices = JSON.parse(cleanJsonResponse(extractedServicesText));
            elizaLogger.debug("extracted the following services from the conversation:", extractedServicesText);

            // Validate services details
            if (extractedServices.success === false || extractedServices.success === "false") {
                elizaLogger.info("Need more information from the user to advertise services.");
                if (callback) {
                    callback({
                        text: extractedServices.result,
                        action: "SELL_SERVICES",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // prepare the service ad
            const serviceAd = await prepareServiceAd(extractedServices.result, runtime);

            // publish the service ad to IPFS
            const CID = await payAIClient.publishPreparedServiceAd(serviceAd);
            let responseToUser = `Successfully advertised your services. Your Service Ad's IPFS CID is ${CID}`;

            // create the services file locally
            const servicesFilePath = payAIClient.servicesConfigPath;
            elizaLogger.debug("Updating the local services file with the seller's services");
            payAIClient.saveSellerServices(JSON.stringify(extractedServices.result, null, 2));
            elizaLogger.info("Updated services file locally at:", servicesFilePath);

            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: responseToUser,
                        action: "SELL_SERVICES",
                        source: message.content.source,
                        services: extractedServices.result,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                await runtime.messageManager.createMemory(newMemory);

                // send message to the user
                callback(newMemory.content);
            }

            return true;

        } catch (error) {
            elizaLogger.error('Error in SELL_SERVICES handler:', error);
            console.error(error);
            if (callback) {
                callback({
                    text: "Error processing SELL_SERVICES request.",
                    action: "SELL_SERVICES",
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
                    text: "I want to sell my services."
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Okay! Please tell me more about the services you want to sell. Can you tell me the name, description, and price?",
                    action: "SELL_SERVICES"
                },
            },            
            {
                user: "{{user1}}",
                content: {
                    text: "I want to sell web development services for $50 per hour."
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully advertised your services. Your Service Ad's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                    action: "SELL_SERVICES"
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to sell graphic design services."
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Please provide the services you want to sell, including the name, description, and price.",
                    action: "SELL_SERVICES"
                },
            }
        ]
    ],
};

export default advertiseServicesAction;
