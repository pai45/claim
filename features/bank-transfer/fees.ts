export const BANK_TRANSFER_CONVENIENCE_FEE = 10;

export function bankTransferTotal(amount: number): number {
  return amount + BANK_TRANSFER_CONVENIENCE_FEE;
}
