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
import { getAllDbEntriesWithCIDs } from '../utils.ts';


// query for LLM to find PayAI services that match the user's query
const findMatchingServicesTemplate = `
Analyze the following conversation to extract a list of services that match what the user is looking for.

The Service Name is the name of the service that the Seller is offering.
The Service Description is a brief description of the service.
The Service Price is the price of the service.
The Required Info is any additional details that the buyer needs to provide to the seller to complete the service.
The Seller is identified by their solana wallet address.
The Service Ad CID is identified by the hash of the entry.
The Service ID is the unique identifier of the service within a service advertisement.
The Contact Info is the contact information of the seller. This can be a twitter handle and/or a libp2p peer id.

All possible services:

{{services}}


Conversation:

{{searchQuery}}


Return a JSON object containing all of the services that match what the user is looking for.
For example:
{
    "success": true,
    "result": "Here are the services that match your query:\n\nService Name\nService Description\nService Price\nRequired Info\nSeller: B2imQsisfrTLoXxzgQfxtVJ3vQR9bGbpmyocVu3nWGJ6\nService Ad CID: bafyreifo4inpuekp466muw2bmldqkg6zetiwi6psjyiwzzyz35bsmcvhrq\nService ID\nContact Info\n\nService Name\nService Description\nService Price\nRequired Info\nSeller: updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM\nService Ad CID: bafyreifo4inpuekp46zetiwi6psjyiwzzyz35bsmcvhrq6muw2bmldqkg6\nService ID\nContact Info"
}

If no matching services were found, then set the "success" field to false and set the result to a string informing the user that no matching services were found, and ask them to try rewording their search. Be natural and polite.
For example, if there were no matching services, then return:
{
    "success": false,
    "result": "A natural message informing the user that no matching services were found, and to try rewording their search."
}

Only return a JSON mardown block.
`;

const formatResponseForTwitterTemplate = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Prepare a response for Twitter.
It needs to be 280 characters or less.

You previously gave me a list of services that are available on the PayAI marketplace.

Here is the list of services:

{{matchingServices}}

I need you to choose only one service from the list, that best matches the user's query.

Here is the user's query:

{{searchQuery}}

You should prefer services that have contact information that includes a Twitter handle.

I want you to prepare your response so that it only includes
 - the seller's Twitter handle
 - the cost of the service
 - the ipfs link to the service ad including the CID

For example:
{
    "success": true,
    "result": "I found a seller that offers this service! The seller is @tickertaco_ and the cost is 1 SOL. Here is the link to the service ad: https://ipfs.io/ipfs/bafyreifo4inpuekp46zetiwi6psjyiwzzyz35bsmcvhrq6muw2bmldqkg6"
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

            // query for all services in the database
            const services = await getAllDbEntriesWithCIDs(
                payAIClient.serviceAdsDB
            );
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

            // if the source of the message is twitter, then format the response for twitter
            if (callback && message.content.source === "twitter") {
                state.matchingServices = matchingServices.result;
                const formatResponseForTwitterContext = composeContext({
                    state,
                    template: formatResponseForTwitterTemplate,
                });

                const formatResponseForTwitterContent = await generateText({
                    runtime,
                    context: formatResponseForTwitterContext,
                    modelClass: ModelClass.LARGE,
                });

                const responseToUser = JSON.parse(cleanJsonResponse(formatResponseForTwitterContent));
                elizaLogger.info("response to user:", responseToUser);

                // create new memory of the message to the user
                const newMemory: Memory = {
                    userId: message.agentId,
                    agentId: message.agentId,
                    roomId: message.roomId,
                    content: {
                        text: responseToUser.result,
                        action: "BROWSE_PAYAI_AGENTS",
                        source: message.content.source,
                    },
                    embedding: getEmbeddingZeroVector()
                };
                await callback(newMemory.content);
                await runtime.messageManager.createMemory(newMemory);
                return true;
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

                // send message to the user
                await callback(newMemory.content);
                await runtime.messageManager.createMemory(newMemory);
            }

            return true;
        } catch (error) {
            console.error('Error in BROWSE_PAYAI_AGENTS handler:', error);
            
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