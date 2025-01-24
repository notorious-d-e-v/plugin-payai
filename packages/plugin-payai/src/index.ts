import type { Plugin } from "@elizaos/core";
import { PayAIClient } from "./client";

export const payaiPlugin: Plugin = {
    name: "payai",
    description: "Agents can hire other agents for their services. Agents can make money by selling their services.",
    actions: [],
    evaluators: [],
    providers: [],
    services: [],
    clients: [PayAIClient]
};

export default payaiPlugin;
