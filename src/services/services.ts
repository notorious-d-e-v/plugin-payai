/* Services will eventually be moved in here. This will include OrbitDB, IPFS, and any other services that are needed. */
import { Service, IAgentRuntime, elizaLogger, ServiceType, Content, HandlerCallback, stringToUuid, composeContext, generateText, ModelClass, cleanJsonResponse } from "@elizaos/core"
import { JobDetails } from "../types.ts";
import { getTwitterClientFromRuntime } from "../utils.ts";

const successfulResponseToUserTemplate = `
# About {{agentName}}
{{bio}}
{{lore}}

# Task:
Create a twitter post responding to the buyer letting them know that you have completed the work for this job.
Ask them to review the work and then release the payment if they are happy with the work.
Your response should be 260 characters or less.
The completed work is available at the following URL: {{completedWorkUrl}}
Don't tag the user in your response.

Here is a preview of the completed work:
{{previewOfCompletedWork}}

Here is your previous conversation with the buyer:
{{recentMessages}}

For example:
{
    "success": true,
    "result": "A natural message informing the user that the work has been completed, asking them to review the work, and including the URL to the work."
}

Return JSON markdown only.
` 

class PayAIJobManagerService extends Service {
    static get serviceType(): ServiceType {
        return ServiceType.TEXT_GENERATION;
    }

    private handleWorkInterval: NodeJS.Timeout;

    async initialize(runtime: IAgentRuntime): Promise<void> {
        // run handlePayAIWork every 60 seconds
        this.handleWorkInterval = setInterval(() => {
            this.handlePayAIWork(runtime);
        }, 60000);

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
                elizaLogger.debug("Job is completed, now attempting to deliver the work.")

                // prepare a response to the buyer letting them know that the work is completed
                const completedWorkUrl = jobDetails.completedWork.url;
                const previewOfCompletedWork = jobDetails.completedWork.message;
                const contactInfo = jobDetails.contactInfo;
                const state = await runtime.composeState(jobDetails.elizaMessage, 
                    {completedWorkUrl, previewOfCompletedWork}
                );

                const successfulResponseToUserContext = composeContext({
                    state,
                    template: successfulResponseToUserTemplate,
                });
    
                const successfulResponseToUserText = await generateText({
                    runtime,
                    context: successfulResponseToUserContext,
                    modelClass: ModelClass.LARGE,
                });
    
                const successfulResponseToUser = JSON.parse(cleanJsonResponse(successfulResponseToUserText));
                const messageToUser = `@${contactInfo.handle} ${successfulResponseToUser.result}`;
                
                // send the completed work to the buyer using the contact info from the job details
                const twitterClient = await getTwitterClientFromRuntime(runtime);
                // take the conversationId URL and split it on the / and take the last part
                const coversationId = jobDetails.contactInfo.conversationId.split("/").pop();
                try {
                    await twitterClient.post.postTweet(
                        runtime,
                        twitterClient.client,
                        messageToUser,
                        jobDetails.contactInfo.roomId,
                        messageToUser,
                        coversationId
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
                await runtime.cacheManager.delete(`${runtime.agentId}-payai-contracts-${contract}`);      
                elizaLogger.debug("Contract removed from cache");
                // TODO: create an orbitdb database to store completed job and details
            }

            else {
                // TODO: Implement the logic to handle unknown job statuses
                elizaLogger.warn("Unknown job status, dropping job. You should look into this.")
                elizaLogger.debug("jobDetails: ", jobDetails);

                // remove the contract from the cache
                await runtime.cacheManager.delete(`${runtime.agentId}-payai-contracts-${contract}`);
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
    
    // compose the state
    const state = await runtime.composeState(jobDetails.elizaMessage, {
        jobDetails: jobDetails,
    });

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
            state,
            (response: Content) => {
                return callback(response);
            }
        )
    }

    // job is completed, mark it as completed in cache
    // refetch the jobDetails from the cache as they were updated in the callback
    jobDetails = await runtime.cacheManager.get<JobDetails>(`${runtime.agentId}-payai-job-details-contract-${contract}`);
    if (jobDetails?.completedWork?.url) {
        jobDetails.status = "COMPLETED";
        elizaLogger.debug("Marked job as COMPLETED");
    }
    else {
        jobDetails.status = "FAILED";
        elizaLogger.debug("Marked job as FAILED");
    }
    await runtime.cacheManager.set(`${runtime.agentId}-payai-job-details-contract-${contract}`, jobDetails);
}

export const payAIJobManagerService = new PayAIJobManagerService();