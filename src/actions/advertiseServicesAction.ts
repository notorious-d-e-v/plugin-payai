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
import { prepareServiceAd, getCIDFromOrbitDbHash } from '../utils.ts';



const extractServicesTemplate = `
Analyze the following conversation to extract the services that the user wants to sell.
There could be multiple services, so make sure you extract all of them.

{{recentMessages}}

Return a JSON object containing only the fields where information was clearly found.
For example:
{
    "success": true,
    "result": [
        {
            "name": "First Service Name",
            "description": "First Service Description",
            "price": "First Service Price"
        },
        {
            "name": "Second Service Name",
            "description": "Second Service Description",
            "price": "Second Service Price"
        }
    ]
}

If the user did not provide enough information, then set the "success" field to false and set the result to a string asking the user to provide the missing information. If asking for missing information, be natural and polite.
For example, if you could not find the services, then return:
{
    "success": false,
    "result": "A natural message asking the user to provide information on the services they want to sell."
}

Only return a JSON mardown block.
`;

const confirmServicesTemplate = `
Look for confirmation from the user that the following services are the only ones they are selling at the moment.

{{services}}

User's recent messages are below.

{{recentMessages}}


Return a JSON object containing only the fields where information was clearly found.
If the user confirmed, then set the "success" field to true and set the result to "yes".
For example:
{
    "success": true,
    "result": "yes"
}

If the user did not confirm, then set the "success" field to false and set the result to a string asking the user to confirm.
For example, if you could not find the confirmation, then return:
{
    "success": false,
    "result": "Please confirm that these are the only services you are selling at the moment:\n\n{{services}}"
}

Only return a JSON mardown block.
`;

const advertiseServicesAction: Action = {
    name: "ADVERTISE_SERVICES",
    similes: ["SELL_SERVICES", "OFFER_SERVICES", "LIST_SERVICES"],
    description: "Ask the user for the services they want to sell, create the services file locally, and publish it to the serviceAdsDB.",
    suppressInitialMessage: true,
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        if (message.content.source !== "direct") {
            elizaLogger.debug("ADVERTISE_SERVICES action is only allowed when interacting with the direct client. This message was from:", message.content.source);
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
                        action: "ADVERTISE_SERVICES",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // Confirm with the user that these are the only services they are selling
            state.services = extractedServices.result.map((service: any) =>
                `Name: ${service.name}\nDescription: ${service.description}\nPrice: ${service.price}`
            ).join('\n\n');
            const confirmServicesContext = composeContext({
                state,
                template: confirmServicesTemplate,
            });

            const confirmServicesText = await generateText({
                runtime,
                context: confirmServicesContext,
                modelClass: ModelClass.SMALL,
            });

            elizaLogger.debug("confirmation from the user:", confirmServicesText);
            const confirmServices = JSON.parse(cleanJsonResponse(confirmServicesText));

            // Validate confirmation
            if (confirmServices.success === false || confirmServices.success === "false") {
                elizaLogger.info("Need confirmation from the user.");
                if (callback) {
                    callback({
                        text: confirmServices.result,
                        action: "ADVERTISE_SERVICES",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // create the services file locally
            const servicesFilePath = payAIClient.servicesConfigPath;
            elizaLogger.debug("writing the following services to the services file:", extractedServices.result);
            fs.writeFileSync(servicesFilePath, JSON.stringify(extractedServices.result, null, 2));
            elizaLogger.info("Created services file locally at:", servicesFilePath);

            // prepare the service ad
            const serviceAd = await prepareServiceAd(extractedServices.result, runtime);

            // publish the service ad to IPFS
            elizaLogger.debug("Publishing service ad to IPFS:", serviceAd);
            const result = await payAIClient.serviceAdsDB.put(serviceAd);
            const CID = getCIDFromOrbitDbHash(result);
            elizaLogger.info("Published Service Ad to IPFS: ", CID);

            let responseToUser = `Successfully advertised your services. Your Service Ad's IPFS CID is ${CID}`;

            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: responseToUser,
                        action: "ADVERTISE_SERVICES",
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
            elizaLogger.error('Error in ADVERTISE_SERVICES handler:', error);
            console.error(error);
            if (callback) {
                callback({
                    text: "Error processing ADVERTISE_SERVICES request.",
                    action: "ADVERTISE_SERVICES",
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
                    text: "I want to sell web development services for $50 per hour."
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully advertised your services. Your Service Ad's IPFS CID is bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                    action: "ADVERTISE_SERVICES"
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
                    action: "ADVERTISE_SERVICES"
                },
            }
        ]
    ],
};

export default advertiseServicesAction;
