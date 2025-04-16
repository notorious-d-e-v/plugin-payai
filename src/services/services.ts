/* Services will eventually be moved in here. This will include OrbitDB, IPFS, and any other services that are needed. */
import { Service, IAgentRuntime, elizaLogger, ServiceType, Content, HandlerCallback, stringToUuid } from "@elizaos/core"
import { JobDetails } from "../types.ts";
import { getTwitterClientFromRuntime } from "../utils.ts";
class PayAIJobManagerService extends Service {
    static get serviceType(): ServiceType {
        return ServiceType.TEXT_GENERATION;
    }

    private handleWorkInterval: NodeJS.Timeout;

    async initialize(runtime: IAgentRuntime): Promise<void> {
        // run handlePayAIWork every 60 seconds
        this.handleWorkInterval = setInterval(() => {
            this.handlePayAIWork(runtime);
        }, 30000);

        elizaLogger.info("PayAIJobManagerService initialized");
    }

    async stop() {
        clearInterval(this.handleWorkInterval);
        elizaLogger.info("PayAIJobManagerService stopped");
    }

    /**
     * Handles PayAI work tasks in the background
     * @param runtime The agent runtime instance
     */
    async handlePayAIWork(runtime: IAgentRuntime) {
        elizaLogger.debug("Checking for new jobs to work on.");
        // Check cache for new PayAI jobs
        const cacheKey = `${runtime.agentId}-payai-contracts`;
        const contracts: { [key: string]: string } = await runtime.cacheManager.get(cacheKey);

        if (!contracts) {
            elizaLogger.debug("No new jobs to be worked");
            return; // No contracts to process
        }
        // go through the contracts and look it up in the cacheManager job details        
        for (let contract in contracts) {

            // get the job details from the cacheManager
            const jobDetails = await runtime.cacheManager.get<JobDetails>(
                `${runtime.agentId}-payai-job-details-contract-${contract}`
            );

            // if the status of the job
            // TODO replace this with a task manager / job runner
            if (jobDetails.status === "NOT_STARTED") {

                try {
                    await runJob(runtime, contract, jobDetails);
                } catch (error) {
                    // log the error
                    console.error(error);
                    elizaLogger.error(`Error working on job ${jobDetails.agreementCID}:`, error);
                    
                    // mark job as failed in cache
                    jobDetails.status = "FAILED";
                    await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
                    elizaLogger.debug("Marked job as FAILED");
                }
            }
            
            else if (jobDetails.status === "IN_PROGRESS") {
                // TODO: Implement the logic to check if the work is complete
                elizaLogger.debug("Job is in progress, need to implement checking if the work is complete.")
            }

            else if (jobDetails.status === "COMPLETED") {
                // TODO: remove the contract from the cache and remove the job details from the cache
                elizaLogger.debug("Job is completed, now attempting to deliver the work.")

                // read the completed work from the job details
                // and send the completed work to the buyer using the contact info from the job details
                const completedWork = jobDetails.completedWork;
                const contactInfo = jobDetails.contactInfo;
                const messageToUser = `@${contactInfo.handle} I've completed the work for this contract. ${completedWork.url}`;

                // post the new tweet
                const twitterClient = await getTwitterClientFromRuntime(runtime);
                try {
                    const newTweet = await twitterClient.post.postTweet(
                        runtime,
                        twitterClient.client,
                        messageToUser,
                        jobDetails.contactInfo.roomId,
                        messageToUser,
                    );

                    // mark the job as delivered
                    jobDetails.status = "DELIVERED";
                    await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
                    elizaLogger.debug("Marked job as DELIVERED");

                } catch (error) {
                    elizaLogger.error("Error posting new tweet: ", error);
                    console.error(error);
                }

            }

            else if (jobDetails.status === "FAILED") {
                // TODO: Implement the logic to handle failed jobs
                elizaLogger.debug("Job failed, now attempting to retry the job.")   
                // retry the job
                await runJob(runtime, contract, jobDetails);
            }

            else if (jobDetails.status === "DELIVERED") {
                elizaLogger.debug("Job delivered, any cleanup work can be done here.")
                // remove the contract from the cache
                await runtime.cacheManager.remove(`${runtime.agentId}-payai-contracts-${contract}`);
                
                // TODO: create an orbitdb database to store completed job and details
            }

            else {
                // TODO: Implement the logic to handle unknown job statuses
                elizaLogger.warn("Unknown job status, dropping job. You should look into this.")
                elizaLogger.debug("jobDetails: ", jobDetails);

                // remove the contract from the cache
                await runtime.cacheManager.remove(`${runtime.agentId}-payai-contracts-${contract}`);
            }
        }
    }
}

async function runJob(runtime: IAgentRuntime, contract: string, jobDetails: JobDetails) {
    const callback: HandlerCallback = async (
        response: Content,
        files?: Record<string, string>
    ) => {
        // store the response in the job details
        jobDetails.completedWork = {
            message: response.text,
            url: response.url
        };
        // update the job details in the cache
        await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);

        return [{
            userId: jobDetails.elizaMessage.userId,
            agentId: jobDetails.elizaMessage.agentId,
            content: {
                text: response.text,
                url: response.url
            },
            roomId: stringToUuid(`payai-${contract}-${runtime.agentId}`)
        }];
    }
    
    // get a mapping from the character file that maps service IDs to actions that the character performs
    const serviceToActions = runtime.character.payai?.serviceToActions;
    const buyOffer = jobDetails.buyOffer;
    
    const desiredServiceID = buyOffer.desiredServiceID;
    const desiredUnitAmount = buyOffer.desiredUnitAmount;
    
    // get the action from the serviceToActions mapping
    const action = serviceToActions[desiredServiceID];

    // mark job as IN_PROGRESS
    jobDetails.status = "IN_PROGRESS";
    await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
    elizaLogger.debug("marked job as IN_PROGRESS");
    
    // loop through the range of 0 to desiredUnitAmount
    for (let i = 0; i < desiredUnitAmount; i++) {
        // execute the action
        await runtime.processActions(
            jobDetails.elizaMessage,
            [
                {
                    userId: jobDetails.elizaMessage.userId,
                    agentId: jobDetails.elizaMessage.agentId,
                    roomId: jobDetails.elizaMessage.roomId,
                    content: {
                        text: "",
                        action: action,
                        source: jobDetails.elizaMessage.content.source
                    },
                    embedding: []
                }
            ],
            undefined,
            callback
        )
    }

    // job is completed, mark it as completed in cache
    jobDetails.status = "COMPLETED";
    await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
    elizaLogger.debug("Marked job as COMPLETED");
}

export const payAIJobManagerService = new PayAIJobManagerService();