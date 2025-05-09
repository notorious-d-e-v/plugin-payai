/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getProgramDerivedAddress,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { PAYAI_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';

export const UPDATE_BUYER_FEE_DISCRIMINATOR = new Uint8Array([
  94, 177, 87, 223, 151, 1, 247, 192,
]);

export function getUpdateBuyerFeeDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    UPDATE_BUYER_FEE_DISCRIMINATOR
  );
}

export type UpdateBuyerFeeInstruction<
  TProgram extends string = typeof PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountSigner extends string | IAccountMeta<string> = string,
  TAccountGlobalState extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountSigner extends string
        ? WritableSignerAccount<TAccountSigner> &
            IAccountSignerMeta<TAccountSigner>
        : TAccountSigner,
      TAccountGlobalState extends string
        ? WritableAccount<TAccountGlobalState>
        : TAccountGlobalState,
      ...TRemainingAccounts,
    ]
  >;

export type UpdateBuyerFeeInstructionData = {
  discriminator: ReadonlyUint8Array;
  newFee: bigint;
};

export type UpdateBuyerFeeInstructionDataArgs = { newFee: number | bigint };

export function getUpdateBuyerFeeInstructionDataEncoder(): Encoder<UpdateBuyerFeeInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['newFee', getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: UPDATE_BUYER_FEE_DISCRIMINATOR })
  );
}

export function getUpdateBuyerFeeInstructionDataDecoder(): Decoder<UpdateBuyerFeeInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['newFee', getU64Decoder()],
  ]);
}

export function getUpdateBuyerFeeInstructionDataCodec(): Codec<
  UpdateBuyerFeeInstructionDataArgs,
  UpdateBuyerFeeInstructionData
> {
  return combineCodec(
    getUpdateBuyerFeeInstructionDataEncoder(),
    getUpdateBuyerFeeInstructionDataDecoder()
  );
}

export type UpdateBuyerFeeAsyncInput<
  TAccountSigner extends string = string,
  TAccountGlobalState extends string = string,
> = {
  signer: TransactionSigner<TAccountSigner>;
  globalState?: Address<TAccountGlobalState>;
  newFee: UpdateBuyerFeeInstructionDataArgs['newFee'];
};

export async function getUpdateBuyerFeeInstructionAsync<
  TAccountSigner extends string,
  TAccountGlobalState extends string,
  TProgramAddress extends Address = typeof PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: UpdateBuyerFeeAsyncInput<TAccountSigner, TAccountGlobalState>,
  config?: { programAddress?: TProgramAddress }
): Promise<
  UpdateBuyerFeeInstruction<
    TProgramAddress,
    TAccountSigner,
    TAccountGlobalState
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? PAYAI_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    signer: { value: input.signer ?? null, isWritable: true },
    globalState: { value: input.globalState ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.globalState.value) {
    accounts.globalState.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(
          new Uint8Array([
            103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101,
          ])
        ),
      ],
    });
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.signer),
      getAccountMeta(accounts.globalState),
    ],
    programAddress,
    data: getUpdateBuyerFeeInstructionDataEncoder().encode(
      args as UpdateBuyerFeeInstructionDataArgs
    ),
  } as UpdateBuyerFeeInstruction<
    TProgramAddress,
    TAccountSigner,
    TAccountGlobalState
  >;

  return instruction;
}

export type UpdateBuyerFeeInput<
  TAccountSigner extends string = string,
  TAccountGlobalState extends string = string,
> = {
  signer: TransactionSigner<TAccountSigner>;
  globalState: Address<TAccountGlobalState>;
  newFee: UpdateBuyerFeeInstructionDataArgs['newFee'];
};

export function getUpdateBuyerFeeInstruction<
  TAccountSigner extends string,
  TAccountGlobalState extends string,
  TProgramAddress extends Address = typeof PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: UpdateBuyerFeeInput<TAccountSigner, TAccountGlobalState>,
  config?: { programAddress?: TProgramAddress }
): UpdateBuyerFeeInstruction<
  TProgramAddress,
  TAccountSigner,
  TAccountGlobalState
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? PAYAI_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    signer: { value: input.signer ?? null, isWritable: true },
    globalState: { value: input.globalState ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.signer),
      getAccountMeta(accounts.globalState),
    ],
    programAddress,
    data: getUpdateBuyerFeeInstructionDataEncoder().encode(
      args as UpdateBuyerFeeInstructionDataArgs
    ),
  } as UpdateBuyerFeeInstruction<
    TProgramAddress,
    TAccountSigner,
    TAccountGlobalState
  >;

  return instruction;
}

export type ParsedUpdateBuyerFeeInstruction<
  TProgram extends string = typeof PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    signer: TAccountMetas[0];
    globalState: TAccountMetas[1];
  };
  data: UpdateBuyerFeeInstructionData;
};

export function parseUpdateBuyerFeeInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedUpdateBuyerFeeInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 2) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      signer: getNextAccount(),
      globalState: getNextAccount(),
    },
    data: getUpdateBuyerFeeInstructionDataDecoder().decode(instruction.data),
  };
}
