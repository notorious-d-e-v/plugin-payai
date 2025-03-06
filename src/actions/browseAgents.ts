import {
    IAgentRuntime,
    Memory,
    ModelClass,
    HandlerCallback,
    State,
    composeContext,
    elizaLogger,
    generateText,
    getEmbeddingZeroVector,
    cleanJsonResponse,
    type Action,
    type Content
 } from '@elizaos/core';
import { payAIClient } from '../clients/client.ts';


// query for LLM to find PayAI services that match the user's query
const findMatchingServicesTemplate = `
Analyze the following conversation to extract a list of services that match what the user is looking for.

The Service Name is the name of the service that the Seller is offering.
The Service Description is a brief description of the service.
The Service Price is the price of the service.
The Seller is identified by their solana wallet address.
The Service Ad CID is identified by the hash of the entry.
The Service ID is the unique identifier of the service within a service advertisement.


All possible services:

{{services}}


Conversation:

{{searchQuery}}


Return a JSON object containing all of the services that match what the user is looking for.
For example:
{
    "success": true,
    "result": "Here are the services that match your query:\n\nService Name\nService Description\nService Price\nSeller: B2imQsisfrTLoXxzgQfxtVJ3vQR9bGbpmyocVu3nWGJ6\nService Ad CID: zdpuAuhwXA4NGv5Qqc6nFHPjHtFxcqnYRSGyW1FBCkrfm2tgF\nService ID\n\nService Name\nService Description\nService Price\nSeller: updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM\nService Ad CID: zdpuAn5qVvoT1h2KfwNxZehFnNotCdBeEgVFGYTBuSEyKPtDB\nService ID"
}

If no matching services were found, then set the "success" field to false and set the result to a string informing the user that no matching services were found, and ask them to try rewording their search. Be natural and polite.
For example, if there were no matching services, then return:
{
    "success": false,
    "result": "A natural message informing the user that no matching services were found, and to try rewording their search."
}

Only return a JSON mardown block.
`;


/*
 * Action to browse PayAI agents
 * This action allows users to search through the PayAI marketplace to find a seller providing a service that matches what they are looking for.
 * The user provides a query to search for, and the action returns a list of services that match the query.
 */
const browseAgents: Action = {
    name: "BROWSE_PAYAI_AGENTS",
    similes: ["SEARCH_SERVICES", "FIND_SELLER", "HIRE_AGENT", "FIND_SERVICE"],
    description: "Search through the PayAI marketplace to find a seller providing a service that the buyer is looking for.",
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
            const searchQuery = message.content.text;

            if (!state) {
                // Initialize or update state
                state = (await runtime.composeState(message)) as State;
            } else {
                state = await runtime.updateRecentMessageState(state);
            }

            const services = await payAIClient.serviceAdsDB.all();
            const servicesString = JSON.stringify(services, null, 2);

            state.services = servicesString;
            state.searchQuery = searchQuery;

            const findMatchingServicesContext = composeContext({
                state,
                template: findMatchingServicesTemplate,
            });

            const findMatchingServicesContent = await generateText({
                runtime,
                context: findMatchingServicesContext,
                modelClass: ModelClass.LARGE,
            });

            elizaLogger.debug("found these matching services from the conversation:", findMatchingServicesContent);
            const matchingServices = JSON.parse(cleanJsonResponse(findMatchingServicesContent));

            // communicate failure to the user
            if (matchingServices.success === false || matchingServices.success === "false") {
                elizaLogger.info("Couldn't find any services matching the user's request.");
                if (callback) {
                    callback({
                        text: matchingServices.result,
                        action: "BROWSE_PAYAI_AGENTS",
                        source: message.content.source,
                    });
                }
                return false;
            }

            // communicate success to the user
            const responseToUser = matchingServices.result;
            if (callback) {
                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: responseToUser,
                        action: "BROWSE_PAYAI_AGENTS",
                        source: message.content.source,
                        services: matchingServices.result,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                await runtime.messageManager.createMemory(newMemory);

                // send message to the user
                callback(newMemory.content);
            }

            return true;
        } catch (error) {
            console.error('Error in BROWSE_PAYAI_AGENTS handler:', error);
            if (callback) {
                callback({
                    text: "Error processing BROWSE_PAYAI_AGENTS request.",
                    content: { error: "Error processing BROWSE_PAYAI_AGENTS request." },
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Find an agent that offers web development." },
            },
            {
                user: "{{user2}}",
                content: { text: "Found the following matching services. Check them out below!", action: "BROWSE_PAYAI_AGENTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Show me all services available." },
            },
            {
                user: "{{user2}}",
                content: { text: "Here are all the available services:", action: "BROWSE_PAYAI_AGENTS" },
            },
        ]
    ],
};

export default browseAgents;