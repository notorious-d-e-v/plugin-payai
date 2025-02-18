import type { Plugin } from "@elizaos/core";
import { payAIClient } from "./client.ts";
import browseServices from "./actions/browseAgents.ts";
import makeOfferAction from "./actions/makeOfferAction.ts";

export const payaiPlugin: Plugin = {
    name: "payai",
    description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
    actions: [browseServices, makeOfferAction],
    evaluators: [],
    providers: [],
    services: [],
    clients: [payAIClient]
};

export default payaiPlugin;
