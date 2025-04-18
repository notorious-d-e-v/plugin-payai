import { Memory } from "@elizaos/core";

export interface JobDetails {
    agreementCID: string;
    agreement: any; // TODO: Type this properly once agreement message type is known
    buyOfferCID: string;
    buyOffer: any; // TODO: Type this properly once buyOffer message type is known
    serviceAdCID: string;
    serviceAd: any; // TODO: Type this properly once serviceAd message type is known
    contractAddress: string;
    contractFundedAmount: string;
    contractBuyer: string;
    contractSeller: string;
    contactInfo: {
        client: string;
        roomId: string;
        handle: string;
        conversationId?: string;    // TODO: rename this to postId
    };
    elizaMessage: Memory;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "DELIVERED";
    completedWork: {
        message: string;
        url: string;
    };
}