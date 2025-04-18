import { createHash } from 'crypto';
import { privateKeyFromRaw, generateKeyPair } from '@libp2p/crypto/keys';
import bs58 from 'bs58';
import {
    signBytes,
    createKeyPairFromPrivateKeyBytes,
    verifySignature,
    SignatureBytes
} from '@solana/web3.js';
import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { IAgentRuntime } from '@elizaos/core';
import fs from 'fs';
import path from 'path';

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

/*
 * Converts a Base58 encoded public key to a CryptoKey.
 * @param base58EncodedPublicKey - The Base58 encoded public key.
 * @returns The CryptoKey.
 */
export async function getCryptoKeyFromBase58PublicKey(base58EncodedPublicKey: string): Promise<CryptoKey> {
    const publicKeyBytes = bs58.decode(base58EncodedPublicKey);

    const publicKey = await crypto.subtle.importKey(
        'raw',
        publicKeyBytes,
        { name: 'Ed25519', namedCurve: 'Ed25519' },
        true,
        ['verify']
    );

    return publicKey;
}

/*
 * Converts a CryptoKey to a Base58 encoded public key.
 * @param publicKey - The CryptoKey to convert.
 * @returns The Base58 encoded public key.
 */
export async function getBase58PublicKeyFromCryptoKey(publicKey: CryptoKey): Promise<string> {
    const publicKeyBytes = await crypto.subtle.exportKey('raw', publicKey);
    return bs58.encode(new Uint8Array(publicKeyBytes));
}


export async function getOrCreateLibp2pKeypair(keypairPath: string): Promise<any> {
    let keypair;
    if (fs.existsSync(keypairPath)) {
        // load keypair from disk
        keypair = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        keypair = await privateKeyFromRaw(Uint8Array.from(Object.values(keypair.raw)));
        console.log("Loaded existing keypair for libp2p.\n");
    } else {
        // generate new keypair
        keypair = await generateKeyPair('Ed25519');
        console.log("Generated new keypair for libp2p.\n");

        // write keypair to disk, creating the directory if it doesn't exist
        const dir = path.dirname(keypairPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(keypairPath, JSON.stringify(keypair));
    }

    return keypair;
}

export function prepareMessageForHashing(message: object): string {
    // sort the object by key recursively
    const sortedMessage = sortObjectByKey(message);

    // serialize the message
    const serializedMessage = JSON.stringify(sortedMessage);

    // strip the message of any whitespace before hashing
    return serializedMessage.replace(/\s/g, '');
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
    const serializedMessage = prepareMessageForHashing(message);

    // hash the message
    const hash = createHash('sha256').update(serializedMessage).digest();

    // sign the hash
    const signedBytes = await signBytes(privateKey, hash);

    // encode the signature to base58
    const encodedSignature = bs58.encode(signedBytes);

    return encodedSignature;
}

export async function verifyMessage(identity: string, signature: string, message: object): Promise<boolean> {
    // convert the identity from a base58 string to a CryptoKey
    const publicKey = await getCryptoKeyFromBase58PublicKey(identity);

    // serialize the message
    const serializedMessage = prepareMessageForHashing(message);

    // hash the message
    const hash = createHash('sha256').update(serializedMessage).digest();

    // decode the signature
    const decodedSignature = bs58.decode(signature) as SignatureBytes;

    // verify the signature
    return verifySignature(publicKey, decodedSignature, hash);
}


/**
 * Get the CID of an OrbitDB hash.
 * @param hash - The OrbitDB entry's hash.
 * @returns The IPFS CID of the OrbitDB entry.
 */
export function getCIDFromOrbitDbHash(hash: string): string {
    return CID.parse(hash, base58btc).toString();
}

/**
 * Get the CID object of an OrbitDB hash.
 * @param hash - The OrbitDB entry's hash.
 * @returns The IPFS CID object of the OrbitDB entry.
 */
export function getCIDObjectFromOrbitDbHash(hash: string): CID {
    return CID.parse(hash, base58btc);
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
            identity: await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey),
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
export async function prepareServiceAd(services: any, runtime: IAgentRuntime, contactInfo: any): Promise<any> {
    try {
        // get the user's solana private key from the runtime settings
        const userDefinedPrivateKey = runtime.getSetting('SOLANA_PRIVATE_KEY')
        const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
        const base58PublicKey = await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);

        // prepare message using the sellerServices.json file
        const message = {
            services: services.map((service: any, index: number) => {
                return {
                    id: index,
                    ...service
                };
            }),
            wallet: base58PublicKey,
            contactInfo: contactInfo
        };

        const signature = await hashAndSign(message, solanaKeypair.privateKey);
        const formattedServices = {
            message,
            identity: base58PublicKey,
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
 * Prepares an agreement to be published to the PayAI network.
 * @param agreementDetails - The details of the agreement.
 * @param runtime - The runtime context for the client.
 * @returns The agreement that will be published to IPFS.
 */
export async function prepareAgreement(agreementDetails: any, runtime: IAgentRuntime): Promise<any> {
    try {
        // get the user's solana private key from the runtime settings
        const userDefinedPrivateKey = runtime.getSetting('SOLANA_PRIVATE_KEY')
        const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
        const base58PublicKey = await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);

        // prepare message using the agreement details
        const message = {
            ...agreementDetails
        };

        const signature = await hashAndSign(message, solanaKeypair.privateKey);
        const formattedAgreement = {
            message,
            identity: base58PublicKey,
            signature,
            _id: signature
        };

        return formattedAgreement;

    } catch (error) {
        console.error('Error formatting agreement', error);
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
            doc.cid = getCIDFromOrbitDbHash(doc.hash)
            results.push(doc)
        }
    }
    return results
}

/**
 * Return all entries in an orbitdb database, adding to it the ipfs cid.
 * @param db - The orbitdb database to query.
 * @returns All entries in the database with the ipfs cid attached.
 */
export async function getAllDbEntriesWithCIDs(db: any): Promise<any> {
    const results = []

    for await (const doc of db.iterator()) {
        doc.cid = getCIDFromOrbitDbHash(doc.hash)
        results.push(doc)
    }
    return results
}

/**
 * Get the base58 encoded public key of the user's solana account.
 * @param runtime - The runtime context for the client.
 * @returns The base58 encoded public key of the user's solana account.
 */
export async function getBase58PublicKey(runtime: IAgentRuntime): Promise<string> {
    const userDefinedPrivateKey = runtime.getSetting('SOLANA_PRIVATE_KEY')
    const solanaKeypair = await getSolanaKeypair(userDefinedPrivateKey);
    return await getBase58PublicKeyFromCryptoKey(solanaKeypair.publicKey);
}

/**
 * Sorts an object by key recursively, including arrays.
 * @param message - The object to sort.
 * @returns The sorted object.
 */
function sortObjectByKey(message: object): object {
    // sort the object by key recursively
    const sortedMessage = Object.keys(message).sort().reduce((obj: any, key: string) => {
        if (message[key] && typeof message[key] === 'object') {
            if (Array.isArray(message[key])) {
                // recursively sort array elements if they are objects
                obj[key] = message[key].map((item: any) => 
                    typeof item === 'object' && item !== null ? sortObjectByKey(item) : item
                );
            } else {
                // recursively sort nested objects
                obj[key] = sortObjectByKey(message[key]);
            }
        } else {
            obj[key] = message[key];
        }
        return obj;
    }, {});
    return sortedMessage;
}

export async function getTwitterClientFromRuntime(runtime: IAgentRuntime): Promise<any> {
    const twitterClient = runtime.clients.find((client) => {
        if (!client) return false;
        return (client?.constructor?.name === "TwitterManager");
    });
    return twitterClient;
}

/**
 * Get the full link from a short url
 * @param shortUrl - The short url to get the full link from
 * @returns The full link
 */
export async function getFullUrl(shortUrl: string) {
    const response = await fetch(shortUrl);
    return response.url;
}

/*
 * Get the CID from an ipfs url
 * @param shortUrl - The short url to get the CID from
 * @returns The CID
 */
export async function getCIDFromShortUrl(shortUrl: string) {
    // get the full url from the short url
    const url = await getFullUrl(shortUrl);
    
    // parse the ipfs cid from the full url
    // e.g. https://ipfs.io/ipfs/CID
    const cid = await getCIDFromIpfsUrl(url);

    return cid;
}

/**
 * Get the transaction signature from a short url
 * @param shortUrl - The short url to get the transaction signature from
 * @returns The transaction signature
 */
export async function getTxFromShortUrl(shortUrl: string) {
    // get the full url from the short url
    const url = await getFullUrl(shortUrl);

    // parse the transaction signature from the full solscan url
    // e.g. https://solscan.io/tx/2222222222222222222222222222222222222222222222222222222222222222
    const tx = await getTxFromSolscanUrl(url);
    return tx;
}

/**
 * Get the CID from an ipfs url
 * @param ipfsUrl - The ipfs url to get the CID from
 * @returns The CID
 */
export async function getCIDFromIpfsUrl(ipfsUrl: string) {
    // parse the ipfs cid from the full url
    // e.g. https://ipfs.io/ipfs/CID
    const cid = ipfsUrl.split('/ipfs/')[1];
    return cid;
}

/**
 * Get the transaction signature from a solscan url
 * @param url - The solscan url to get the transaction signature from
 * @returns The transaction signature
 */
export async function getTxFromSolscanUrl(url: string) {
    // parse the transaction signature from the full solscan url
    // e.g. https://solscan.io/tx/2222222222222222222222222222222222222222222222222222222222222222
    const tx = url.split('/tx/')[1];
    return tx;
}
