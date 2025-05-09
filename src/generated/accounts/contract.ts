/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  assertAccountExists,
  assertAccountsExist,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  fixDecoderSize,
  fixEncoderSize,
  getAddressDecoder,
  getAddressEncoder,
  getBooleanDecoder,
  getBooleanEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  getUtf8Decoder,
  getUtf8Encoder,
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

export const CONTRACT_DISCRIMINATOR = new Uint8Array([
  172, 138, 115, 242, 121, 67, 183, 26,
]);

export function getContractDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(CONTRACT_DISCRIMINATOR);
}

export type Contract = {
  discriminator: ReadonlyUint8Array;
  cid: string;
  buyer: Address;
  seller: Address;
  amount: bigint;
  buyerCounter: bigint;
  isReleased: boolean;
};

export type ContractArgs = {
  cid: string;
  buyer: Address;
  seller: Address;
  amount: number | bigint;
  buyerCounter: number | bigint;
  isReleased: boolean;
};

export function getContractEncoder(): Encoder<ContractArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['cid', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ['buyer', getAddressEncoder()],
      ['seller', getAddressEncoder()],
      ['amount', getU64Encoder()],
      ['buyerCounter', getU64Encoder()],
      ['isReleased', getBooleanEncoder()],
    ]),
    (value) => ({ ...value, discriminator: CONTRACT_DISCRIMINATOR })
  );
}

export function getContractDecoder(): Decoder<Contract> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['cid', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['buyer', getAddressDecoder()],
    ['seller', getAddressDecoder()],
    ['amount', getU64Decoder()],
    ['buyerCounter', getU64Decoder()],
    ['isReleased', getBooleanDecoder()],
  ]);
}

export function getContractCodec(): Codec<ContractArgs, Contract> {
  return combineCodec(getContractEncoder(), getContractDecoder());
}

export function decodeContract<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): Account<Contract, TAddress>;
export function decodeContract<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeAccount<Contract, TAddress>;
export function decodeContract<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<Contract, TAddress> | MaybeAccount<Contract, TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getContractDecoder()
  );
}

export async function fetchContract<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<Contract, TAddress>> {
  const maybeAccount = await fetchMaybeContract(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeContract<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeAccount<Contract, TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeContract(maybeAccount);
}

export async function fetchAllContract(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<Account<Contract>[]> {
  const maybeAccounts = await fetchAllMaybeContract(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeContract(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeAccount<Contract>[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeContract(maybeAccount));
}
