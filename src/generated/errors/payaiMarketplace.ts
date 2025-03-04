/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  isProgramError,
  type Address,
  type SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  type SolanaError,
} from '@solana/web3.js';
import { PAYAI_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';

/** Unauthorized: Unauthorized action */
export const PAYAI_MARKETPLACE_ERROR__UNAUTHORIZED = 0x1770; // 6000
/** AlreadyReleased: Payment has already been released */
export const PAYAI_MARKETPLACE_ERROR__ALREADY_RELEASED = 0x1771; // 6001
/** InvalidAmount: Invalid escrow amount */
export const PAYAI_MARKETPLACE_ERROR__INVALID_AMOUNT = 0x1772; // 6002

export type PayaiMarketplaceError =
  | typeof PAYAI_MARKETPLACE_ERROR__ALREADY_RELEASED
  | typeof PAYAI_MARKETPLACE_ERROR__INVALID_AMOUNT
  | typeof PAYAI_MARKETPLACE_ERROR__UNAUTHORIZED;

let payaiMarketplaceErrorMessages:
  | Record<PayaiMarketplaceError, string>
  | undefined;
if (process.env.NODE_ENV !== 'production') {
  payaiMarketplaceErrorMessages = {
    [PAYAI_MARKETPLACE_ERROR__ALREADY_RELEASED]: `Payment has already been released`,
    [PAYAI_MARKETPLACE_ERROR__INVALID_AMOUNT]: `Invalid escrow amount`,
    [PAYAI_MARKETPLACE_ERROR__UNAUTHORIZED]: `Unauthorized action`,
  };
}

export function getPayaiMarketplaceErrorMessage(
  code: PayaiMarketplaceError
): string {
  if (process.env.NODE_ENV !== 'production') {
    return (
      payaiMarketplaceErrorMessages as Record<PayaiMarketplaceError, string>
    )[code];
  }

  return 'Error message not available in production bundles.';
}

export function isPayaiMarketplaceError<
  TProgramErrorCode extends PayaiMarketplaceError,
>(
  error: unknown,
  transactionMessage: {
    instructions: Record<number, { programAddress: Address }>;
  },
  code?: TProgramErrorCode
): error is SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM> &
  Readonly<{ context: Readonly<{ code: TProgramErrorCode }> }> {
  return isProgramError<TProgramErrorCode>(
    error,
    transactionMessage,
    PAYAI_MARKETPLACE_PROGRAM_ADDRESS,
    code
  );
}
