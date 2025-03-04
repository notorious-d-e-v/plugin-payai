/*
 * This will handle payment related functionality in the PayAI plugin.
 * Payment currently supports the PayAI solana smart contracts.
 */
import {
    appendTransactionMessageInstruction,
    Commitment,
    CompilableTransactionMessage,
    TransactionMessageWithBlockhashLifetime,
    Rpc,
    RpcSubscriptions,
    SolanaRpcApi,
    SolanaRpcSubscriptionsApi,
    TransactionSigner,
    airdropFactory,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    createSignerFromKeyPair,
    getSignatureFromTransaction,
    lamports,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    KeyPairSigner,
    Account,
  } from '@solana/web3.js';
import { getAddressEncoder, getProgramDerivedAddress, Address } from '@solana/addresses';
import {
    elizaLogger,
    IAgentRuntime
} from '@elizaos/core';
import { getSolanaKeypair } from './utils.ts';
import * as programClient from "./generated/index.ts";

type RpcClient = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  };

class Payment {

    private runtime: IAgentRuntime;
    private programClient: typeof programClient;
    private rpcClient: RpcClient;
    private authority: TransactionSigner;

    constructor() {
        this.programClient = programClient;
    }

    initialize = async (runtime: IAgentRuntime): Promise<void> => {
        elizaLogger.info('Initializing PayAI Payment Client');
        const rpcClient = this.createDefaultSolanaClient(runtime.getSetting('SOLANA_RPC_URL'));
        this.authority = await this.createSignerFromBase58PrivateKey(runtime.getSetting('SOLANA_PRIVATE_KEY'));
    }

    createDefaultSolanaClient = (url: string): RpcClient => {
        const rpc = createSolanaRpc(url);
        const rpcSubscriptions = createSolanaRpcSubscriptions(url.replace('http', 'ws'));
        return { rpc, rpcSubscriptions };
    };

    createSignerFromBase58PrivateKey = async (privateKey: string): Promise<KeyPairSigner> => {
        const keypair = await getSolanaKeypair(privateKey);
        return createSignerFromKeyPair(keypair);
    }

    createDefaultTransaction = async () => {
        const rpcClient = this.rpcClient;
        const feePayer = this.authority;

        const { value: latestBlockhash } = await rpcClient.rpc
            .getLatestBlockhash()
            .send();
        return pipe(
            createTransactionMessage({ version: 0 }),
            (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
            (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
        );
    };

    signAndSendTransaction = async (
        rpcClient: RpcClient,
        transactionMessage: CompilableTransactionMessage &
            TransactionMessageWithBlockhashLifetime,
        commitment: Commitment = 'confirmed'
    ) => {
        const signedTransaction =
            await signTransactionMessageWithSigners(transactionMessage);
        const signature = getSignatureFromTransaction(signedTransaction);

        // send the transaction
        await sendAndConfirmTransactionFactory(rpcClient)(signedTransaction, {
            commitment,
        });

        return signature;
    };

    /*
     * Return the address of the buyer contract counter account.
     * @param buyer - The address of the buyer.
     * @returns The address of the buyer contract counter account.
     */
    getBuyerContractCounterAccountAddress = async (buyer: string): Promise<Address> => {
        const programId = this.programClient.PAYAI_MARKETPLACE_PROGRAM_ADDRESS;
        const addressEncoder = getAddressEncoder();

        const [pda] = await getProgramDerivedAddress({
            programAddress: programId as Address,
            seeds: [
                // Token program
                "buyer_contract_counter",
                // Buyer
                addressEncoder.encode(buyer as Address),
            ],
        });

        return pda as Address;
    }

    /* Return the BuyerContractCounter account for the given buyer.
     * @param buyer - The address of the buyer.
     * @returns The BuyerContractCounter account.
     */
    getBuyerContractCounterAccount = async (buyer: string): Promise<Account<programClient.BuyerContractCounter, Address>> => {
        const buyerContractCounter = await this.getBuyerContractCounterAccountAddress(buyer);
        const counterAccount = await this.programClient.fetchBuyerContractCounter(
            this.rpcClient.rpc,
            buyerContractCounter
        );

        return counterAccount;
    }

    /*
     * Initialize the BuyerContractCounter account for the agent.
     * It uses the agent's SOLANA_PRIVATE_KEY to sign the transaction.
     */
    initializeBuyerContractCounter = async (): Promise<Account<programClient.BuyerContractCounter, Address>> => {
        // const buyerContractCounterAddress = await this.getBuyerContractCounterAccountAddress(this.authority.address);
        const initializeTx = this.programClient.getInitializeBuyerContractCounterInstruction({
            signer: this.authority,
            buyerContractCounter: undefined,  // programClient will auto fetch it
            systemProgram: undefined,  // programClient will auto fetch it
        });

        await pipe(
            await this.createDefaultTransaction(),
            (tx) => appendTransactionMessageInstruction(initializeTx, tx),
            (tx) => this.signAndSendTransaction(this.rpcClient, tx)
        );

        elizaLogger.info('BuyerContractCounter account initialized.');
        const account = await this.getBuyerContractCounterAccount(this.authority.address);
        elizaLogger.debug('BuyerContractCounter account:', account);

        return account;
    }

    startContract = async (cid: string, seller: string, escrowAmount: string) => {
        // fetch buyer contract counter
        const buyer = this.authority.address;
        let buyerContractCounter = await this.getBuyerContractCounterAccount(buyer);

        // initialize buyerContractCounter account if it doesn't exist
        if (!buyerContractCounter) {
            buyerContractCounter = await this.initializeBuyerContractCounter();
        }

        // prepare the start contract instruction
        const startContractTx = this.programClient.getStartContractInstruction({
            signer: this.authority,
            buyerContractCounter: buyerContractCounter.address,
            contract: undefined,  // programClient will auto fetch it
            escrowVault: undefined,  // programClient will auto fetch it
            globalState: undefined,  // programClient will auto fetch it
            systemProgram: undefined,  // programClient will auto fetch it
            cid: cid,
            payoutAddress: seller as Address,
            escrowAmount: lamports(BigInt(escrowAmount)),
        });

        // prepare and send the transaction
        await pipe(
            await this.createDefaultTransaction(),
            (tx) => appendTransactionMessageInstruction(startContractTx, tx),
            (tx) => this.signAndSendTransaction(this.rpcClient, tx)
        );

        elizaLogger.info('Contract started.');
    }

}