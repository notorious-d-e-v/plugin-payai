import type { Client, IAgentRuntime } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";


export const PayAIClient: Client = {
    start: async (runtime: IAgentRuntime) => {
        elizaLogger.info("PayAI Client started");
    }, 
    stop: async (runtime: IAgentRuntime) => {
        elizaLogger.info("PayAI Client stopped");
    }

}
