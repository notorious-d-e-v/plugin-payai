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
    Signature,
    Transaction,
} from '@solana/web3.js';
import { getAddressEncoder, getProgramDerivedAddress, Address, getBytesEncoder } from '@solana/web3.js';
import {
    elizaLogger,
    IAgentRuntime
} from '@elizaos/core';
import { getSolanaKeypair } from './utils.ts';
import {
    BuyerContractCounter,
    GlobalState,
    PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
    fetchBuyerContractCounter,
    getInitializeBuyerContractCounterInstruction,
    getStartContractInstructionAsync,
    StartContractAsyncInput,
    fetchContract
} from "./generated/index.ts";
import { fetchGlobalState } from './generated/accounts/globalState.ts';

type RpcClient = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

class Payment {
    private runtime: IAgentRuntime;
    private rpcClient: RpcClient;
    private authority: TransactionSigner;

    constructor() {}

    /*
     * Initialize the payment client.
     * @param runtime - The runtime.
     */
    initialize = async (runtime: IAgentRuntime): Promise<void> => {
        elizaLogger.info('Initializing PayAI Payment Client');
        this.rpcClient = this.createDefaultSolanaClient(runtime);
        this.authority = await this.createSignerFromBase58PrivateKey(runtime.getSetting('SOLANA_PRIVATE_KEY'));
    }

    /*
     * Create a default Solana client.
     * @param runtime - The runtime.
     * @returns The Solana client.
     */
    createDefaultSolanaClient = (runtime: IAgentRuntime): RpcClient => {
        const url = runtime.getSetting('SOLANA_RPC_URL');
        const wsUrl = runtime.getSetting("SOLANA_WS_URL");
        const rpc = createSolanaRpc(url);
        const rpcSubscriptions = createSolanaRpcSubscriptions(wsUrl);
        return { rpc, rpcSubscriptions };
    };

    /*
     * Create a signer from a base58 private key.
     * @param privateKey - The private key.
     * @returns The signer.
     */
    createSignerFromBase58PrivateKey = async (privateKey: string): Promise<KeyPairSigner> => {
        const keypair = await getSolanaKeypair(privateKey);
        return createSignerFromKeyPair(keypair);
    }

    /*
     * Fetch a transaction from the RPC.
     * @param signature - The signature of the transaction.
     * @returns The transaction.
     */
    fetchTransaction = async (signature: string): Promise<any> => {
        const tx = await this.rpcClient.rpc.getTransaction(signature as Signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        }).send();
        return tx;
    }

    /*
     * Create a default transaction.
     * @returns The default transaction.
     */
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

    /*
     * Sign and send a transaction.
     * @param rpcClient - The RPC client.
     * @param transactionMessage - The transaction message.
     * @param commitment - The commitment level.
     * @returns The signature of the transaction.
     */
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
        const addressEncoder = getAddressEncoder();
        const bytesEncoder = getBytesEncoder();

        const [pda] = await getProgramDerivedAddress({
            programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS as Address,
            seeds: [
                // "buyer_contract_counter" as bytes
                bytesEncoder.encode(new Uint8Array([
                    98, 117, 121, 101, 114, 95, 99, 111, 110, 116, 114, 97, 99, 116, 95,
                    99, 111, 117, 110, 116, 101, 114
                ])),
                addressEncoder.encode(buyer as Address),
            ],
        });

        return pda as Address;
    }

    /*
     * Return the address of the contract account.
     * @param signer - The address of the signer.
     * @param counter - The counter value from the buyer contract counter.
     * @returns The address of the contract account.
     */
    getContractAccountAddress = async (signer: string, counter: bigint): Promise<Address> => {
        const addressEncoder = getAddressEncoder();
        const bytesEncoder = getBytesEncoder();

        // Create a 8-byte buffer for the u64 counter
        const counterBuffer = new ArrayBuffer(8);
        const view = new DataView(counterBuffer);
        // Write the lower 32 bits
        view.setUint32(0, Number(counter & BigInt(0xFFFFFFFF)), true);
        // Write the upper 32 bits
        view.setUint32(4, Number(counter >> BigInt(32)), true);

        const [pda] = await getProgramDerivedAddress({
            programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS as Address,
            seeds: [
                // "contract" as bytes
                bytesEncoder.encode(new Uint8Array([
                    99, 111, 110, 116, 114, 97, 99, 116
                ])),
                addressEncoder.encode(signer as Address),
                new Uint8Array(counterBuffer)
            ],
        });

        return pda as Address;
    }

    /* Return the BuyerContractCounter account for the given buyer.
     * @param buyer - The address of the buyer.
     * @returns The BuyerContractCounter account.
     */
    getBuyerContractCounterAccount = async (buyer: string): Promise<Account<BuyerContractCounter, Address>> => {
        const buyerContractCounter = await this.getBuyerContractCounterAccountAddress(buyer);
        
        try {
            const counterAccount = await fetchBuyerContractCounter(
                this.rpcClient.rpc,
                buyerContractCounter
            );

            return counterAccount;
        } catch (error) {
            elizaLogger.error('BuyerContractCounter account not found');
            return null;
        }
    }

    /*
     * Return the address of the global state account.
     * @returns The address of the global state account.
     */
    getGlobalStateAccountAddress = async (): Promise<Address> => {
        const bytesEncoder = getBytesEncoder();

        const [pda] = await getProgramDerivedAddress({
            programAddress: PAYAI_MARKETPLACE_PROGRAM_ADDRESS as Address,
            seeds: [
                // "global_state" as bytes
                bytesEncoder.encode(new Uint8Array([103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]))
            ],
        });

        return pda as Address;
    }

    /* 
     * Return the global state account.
     * @returns The global state account.
     */
    getGlobalStateAccount = async (): Promise<Account<GlobalState, Address>> => {
        const globalStateAddress = await this.getGlobalStateAccountAddress();
        const globalState = await fetchGlobalState(this.rpcClient.rpc, globalStateAddress);
        return globalState;
    }

    /*
     * Initialize the BuyerContractCounter account for the agent.
     * It uses the agent's SOLANA_PRIVATE_KEY to sign the transaction.
     */
    initializeBuyerContractCounter = async (): Promise<Account<BuyerContractCounter, Address>> => {
        const initializeTx = getInitializeBuyerContractCounterInstruction({
            signer: this.authority,
            buyerContractCounter: await this.getBuyerContractCounterAccountAddress(this.authority.address),
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
        elizaLogger.debug('Executing contract by funding escrow...');

        // fetch buyer contract counter
        const buyer = this.authority.address;
        let buyerContractCounter = await this.getBuyerContractCounterAccount(buyer);

        // initialize buyerContractCounter account if it doesn't exist
        if (!buyerContractCounter) {
            elizaLogger.debug('BuyerContractCounter account not found, initializing...');
            buyerContractCounter = await this.initializeBuyerContractCounter();
            elizaLogger.debug('BuyerContractCounter account initialized.');
        }

        // get the contract account address
        const contractAccountAddress = await this.getContractAccountAddress(buyer, buyerContractCounter.data?.counter)
        const globalStateAddress = await this.getGlobalStateAccountAddress();
        const globalState = await this.getGlobalStateAccount();

        // prepare the start contract instruction
        const startContractTx = await getStartContractInstructionAsync({
            signer: this.authority,
            buyerContractCounter: buyerContractCounter,
            contract: contractAccountAddress,
            globalState: globalStateAddress,
            cid: cid,
            payoutAddress: seller as Address,
            escrowAmount: lamports(BigInt(escrowAmount)),
        });

        // prepare and send the transaction
        const signature = await pipe(
            await this.createDefaultTransaction(),
            (tx) => appendTransactionMessageInstruction(startContractTx, tx),
            (tx) => this.signAndSendTransaction(this.rpcClient, tx)
        );

        elizaLogger.info('Contract started.');
        return signature;
    }

    /*
     * Get the contract account from a transaction signature.
     * @param transactionSignature - The signature of the transaction that created the contract.
     * @returns The contract account data.
     */
    getContractAccountFromTransaction = async (transactionSignature: string): Promise<Account<Contract, Address> | null> => {
        try {
            // get the transaction details
            const transaction = await this.fetchTransaction(transactionSignature);

            if (!transaction) {
                elizaLogger.error('Transaction not found');
                return null;
            }

            // fetch the contract account
            let contractAccount;
            for (const account of transaction.transaction.message.accountKeys) {
                try {
                    contractAccount = await fetchContract(
                        this.rpcClient.rpc,
                        account
                    );
                    
                    if (contractAccount.data) {
                        elizaLogger.debug('Contract found in account', account);
                        break;
                    }
                } catch (error) {
                    elizaLogger.debug('Contract not found in account', account);
                }
            }

            return contractAccount;
        } catch (error) {
            elizaLogger.error('Error getting contract account from transaction:', error);
            return null;
        }
    }
}

const paymentClient = new Payment();

export { paymentClient };