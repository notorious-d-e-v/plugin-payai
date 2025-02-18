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
    parseJsonArrayFromText,
    type Action,
    type Content
 } from '@elizaos/core';
import { payAIClient } from '../client';


// query for LLM to find PayAI services that match the user's query
const findMatchingServicesTemplate =
`Given the following query and list of services, return a list of hashes of services that could match the query.
Respond with a list of strings containing the hashes. Do not respond with any additional text or information outside of the list.
If there are no matches, you can return an empty list.

Query: {{searchQuery}}
Services: {{services}}
`;


/*
 * Action to browse PayAI agents
 * This action allows users to search through the PayAI marketplace to find a seller providing a service that matches what they are looking for.
 * The user provides a query to search for, and the action returns a list of services that match the query.
 */
const browseAgents: Action = {
    name: "BROWSE_PAYAI_AGENTS",
    similes: ["SEARCH_SERVICES", "FIND_SELLER", "HIRE_AGENT", "FIND_SERVICE"],
    description: "Search through the PayAI marketplace to find a seller providing a service that matches what you are looking for.",
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

            // TODO the query can be improved to only select the specific
            // services from a seller, rather than return all of the sellers' services
            const findMatchingServicesContent = await generateText({
                runtime,
                context: findMatchingServicesContext,
                modelClass: ModelClass.SMALL,
            });

            // hashes of services that match the query
            let results = JSON.parse(findMatchingServicesContent.replace(/'/g, '"'));

            // return the list of services that match the hashes
            results = services.filter((service: any) => {
              return results.includes(service.hash);
            });

            // only keep the fields we want to show
            results = results.map((service: any) => {
              return {
                hash: service.hash,
                seller: service.value.message.identity,
                services: service.value.message.services
              };
            });


            if (results.length > 0) {
                if (callback) {
                    const callbackText = `Found ${results.length} matching services. Check them out below!\n\n${JSON.stringify(results, null, 2)}`;

                    // create new memory of the message to the user
                    const newMemory: Memory = {
                        userId: message.agentId,
                        agentId: message.agentId,
                        roomId: message.roomId,
                        content: {
                            text: callbackText,
                            action: "BROWSE_PAYAI_AGENTS",
                            source: message.content.source,
                            services: results,
                        },
                        embedding: getEmbeddingZeroVector()
                    };
                    await runtime.messageManager.createMemory(newMemory);

                    // send message to the user
                    callback(newMemory.content);
                }
            } else {
                if (callback) {
                    callback({
                        text: "No matching service providers found.",
                        content: { error: "No matching services found." },
                        action: "BROWSE_PAYAI_AGENTS",
                    });
                }
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
                content: { text: "Found matching services. Check them out below!", action: "BROWSE_PAYAI_AGENTS" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Show me all services available." },
            },
            {
                user: "{{user2}}",
                content: { text: "Found matching services. Check them out below!", action: "BROWSE_PAYAI_AGENTS" },
            },
        ]
    ],
};

export default browseAgents;