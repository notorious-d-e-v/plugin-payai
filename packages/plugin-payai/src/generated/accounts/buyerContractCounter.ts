/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  assertAccountExists,
  assertAccountsExist,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Account,
  type Address,
  type Codec,
  type Decoder,
  type EncodedAccount,
  type Encoder,
  type FetchAccountConfig,
  type FetchAccountsConfig,
  type MaybeAccount,
  type MaybeEncodedAccount,
  type ReadonlyUint8Array,
} from '@solana/web3.js';

export const BUYER_CONTRACT_COUNTER_DISCRIMINATOR = new Uint8Array([
  181, 162, 88, 45, 74, 176, 199, 99,
]);

export function getBuyerContractCounterDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    BUYER_CONTRACT_COUNTER_DISCRIMINATOR
  );
}

export type BuyerContractCounter = {
  discriminator: ReadonlyUint8Array;
  counter: bigint;
};

export type BuyerContractCounterArgs = { counter: number | bigint };

export function getBuyerContractCounterEncoder(): Encoder<BuyerContractCounterArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['counter', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: BUYER_CONTRACT_COUNTER_DISCRIMINATOR,
    })
  );
}

export function getBuyerContractCounterDecoder(): Decoder<BuyerContractCounter> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['counter', getU64Decoder()],
  ]);
}

export function getBuyerContractCounterCodec(): Codec<
  BuyerContractCounterArgs,
  BuyerContractCounter
> {
  return combineCodec(
    getBuyerContractCounterEncoder(),
    getBuyerContractCounterDecoder()
  );
}

export function decodeBuyerContractCounter<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): Account<BuyerContractCounter, TAddress>;
export function decodeBuyerContractCounter<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeAccount<BuyerContractCounter, TAddress>;
export function decodeBuyerContractCounter<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
):
  | Account<BuyerContractCounter, TAddress>
  | MaybeAccount<BuyerContractCounter, TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getBuyerContractCounterDecoder()
  );
}

export async function fetchBuyerContractCounter<
  TAddress extends string = string,
>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<BuyerContractCounter, TAddress>> {
  const maybeAccount = await fetchMaybeBuyerContractCounter(
    rpc,
    address,
    config
  );
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeBuyerContractCounter<
  TAddress extends string = string,
>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeAccount<BuyerContractCounter, TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeBuyerContractCounter(maybeAccount);
}

export async function fetchAllBuyerContractCounter(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<Account<BuyerContractCounter>[]> {
  const maybeAccounts = await fetchAllMaybeBuyerContractCounter(
    rpc,
    addresses,
    config
  );
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeBuyerContractCounter(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeAccount<BuyerContractCounter>[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) =>
    decodeBuyerContractCounter(maybeAccount)
  );
}

export function getBuyerContractCounterSize(): number {
  return 16;
}
