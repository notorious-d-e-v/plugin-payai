import type { Plugin } from "@elizaos/core";
import { payAIClient } from "./clients/client.ts";
import { payAIJobManagerService } from "./services/services.ts";
import browseServices from "./actions/browseAgents.ts";
import makeOfferAction from "./actions/makeOfferAction.ts";
import acceptOfferAction from "./actions/acceptOfferAction.ts";
import advertiseServicesAction from "./actions/advertiseServicesAction.ts";
import executeContractAction from "./actions/executeContractAction.ts";
import startWork from "./actions/startWork.ts";
import reviewWork from "./actions/reviewWork.ts";

export const payaiPlugin: Plugin = {
    name: "payai",
    description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
    actions: [
        advertiseServicesAction,
        browseServices,
        makeOfferAction,
        acceptOfferAction,
        executeContractAction,
        startWork,
        reviewWork
    ],
    evaluators: [],
    providers: [],
    services: [payAIJobManagerService],
    clients: [payAIClient]
};

export default payaiPlugin;