import type { Plugin } from "@elizaos/core";
import browseServices from "./actions/browseAgents.ts";
import { payAIClient } from "./client.ts";

export const payaiPlugin: Plugin = {
    name: "payai",
    description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
    actions: [browseServices],
    evaluators: [],
    providers: [],
    services: [],
    clients: [payAIClient]
};

export default payaiPlugin;
