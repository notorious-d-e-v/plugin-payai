import { createHash } from 'crypto';
import bs58 from 'bs58';
import { signBytes, createKeyPairFromPrivateKeyBytes, KeyPairSigner } from '@solana/web3.js';
import { IAgentRuntime } from '@elizaos/core';

/**
 * Derives the Solana Keypair from a private key.
 * @param base58PrivateKey - The Base58 encoded private key.
 * @returns The Solana Keypair.
 */
export async function getSolanaKeypair(base58PrivateKey: string): Promise<CryptoKeyPair> {
    // decode the base58 private key
    let secretKeyBytes = bs58.decode(base58PrivateKey);

    // if the length of the secret key bytes is 64, then take the first 32 bytes
    if (secretKeyBytes.length === 64) {
        secretKeyBytes = secretKeyBytes.slice(0, 32);
    }

    // create a Keypair from the secret key
    const { privateKey, publicKey } = await createKeyPairFromPrivateKeyBytes(secretKeyBytes);

    return { privateKey, publicKey };
}

/**
 * Hashes and signs a message using a Solana Keypair.
 * The message is serialized to a string before hashing.
 * The message is stripped of any whitespace before hashing.
 * The hashing algorithm used is SHA-256.
 * @param message - The message to hash and sign.
 * @param keypair - The Solana Keypair to use for signing.
 * @returns The Base58 encoded signature.
 */
export async function hashAndSign(message: any, privateKey: CryptoKey): Promise<string> {
    // serialize the message
    const serializedMessage = JSON.stringify(message);

    // hash the message
    const hash = createHash('sha256').update(serializedMessage.replace(/\s/g, '')).digest();

    // sign the hash
    const signedBytes = await signBytes(privateKey, hash);

    // encode the signature to base58
    const encodedSignature = bs58.encode(signedBytes);

    return encodedSignature;
}

/**
 * Get the CID of an OrbitDB hash.
 * @param hash - The OrbitDB entry's hash.
 * @returns The IPFS CID of the OrbitDB entry.
 */
export function getCIDFromOrbitDbHash(hash: string): string {
    // TODO return the CID once the PayAI entries are available from publicly accessible IPFS nodes
    // return CID.parse(hash, base58btc).toString();
    return hash;
}

/**
 * Prepares a buy offer to be published to the PayAI network.
 * @param offerDetails - The details of the offer.
 * @param runtime - The runtime context for the client.
 * @returns The buy offer that will be published to IPFS.
 */
export async function prepareBuyOffer(offerDetails: any, runtime: IAgentRuntime): Promise<any> {
    try {
        // get the user's solana private key from the runtime settings
        const userDefinedPrivateKey = runtime.getSetting('SOLANA_PRIVATE_KEY')
        const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);

        // Sign the offer message
        const signature = await hashAndSign(offerDetails, solanaKeypair.privateKey);

        const buyOffer = {
            message: offerDetails,
            identity: bs58.encode(new Uint8Array(await crypto.subtle.exportKey('raw', solanaKeypair.publicKey))),
            signature: signature,
            _id: signature  // TODO make this more resilient in the future
        }

        return buyOffer;

    } catch (error) {
        console.error('Error preparing buy offer', error);
        throw error;
    }
}

/**
 * Prepares the sellerServices.json file to be published as a service ad on the PayAI network.
 * @param services - The sellerServices.json file contents.
 * @param runtime - The runtime context for the client.
 * @returns The service ad that will be published to IPFS.
 */
export async function prepareServiceAd(services: any, runtime: IAgentRuntime): Promise<any> {
    try {
        // get the user's solana private key from the runtime settings
        const userDefinedPrivateKey = runtime.getSetting('SOLANA_PRIVATE_KEY')
        const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
        const uint8ArrayPubkey = new Uint8Array(
            await crypto.subtle.exportKey('raw', solanaKeypair.publicKey)
        );

        // prepare message using the sellerServices.json file
        const message = {
            services: services.map((service: any, index: number) => {
                return {
                    id: index,
                    ...service
                };
            }),
            identity: bs58.encode(uint8ArrayPubkey)
        };

        const signature = await hashAndSign(message, solanaKeypair.privateKey);
        const formattedServices = {
            message,
            signature,
            _id: signature  // TODO make this more resilient in the future
        };

        return formattedServices;

    } catch (error) {
        console.error('Error formatting sellerServices.json', error);
        throw error;
    }
}

/**
 * Function to call the given orbitdb database's iterator and query using the find function.
 * Returns the results of the query.
 * This is different from the orbitdb query function in that it returns the entire entry, not just the entry's value.
 * @param db - The orbitdb database to query.
 * @param findFunction - The function to use to query the database.
 * @returns The results of the query.
 */
export async function queryOrbitDbReturningCompleteEntries(db: any, findFunction: any): Promise<any> {
    const results = []

    for await (const doc of db.iterator()) {
        if (findFunction(doc.value)) {
            results.push(doc)
        }
    }
    return results
}
