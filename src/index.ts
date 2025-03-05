import type { Plugin } from "@elizaos/core";
import { payAIClient } from "./clients/client.ts";
import browseServices from "./actions/browseAgents.ts";
import makeOfferAction from "./actions/makeOfferAction.ts";
import acceptOfferAction from "./actions/acceptOfferAction.ts";
import advertiseServicesAction from "./actions/advertiseServicesAction.ts";

export const payaiPlugin: Plugin = {
    name: "payai",
    description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
    actions: [browseServices, makeOfferAction, acceptOfferAction, advertiseServicesAction],
    evaluators: [],
    providers: [],
    services: [],
    clients: [payAIClient]
};

export default payaiPlugin;
