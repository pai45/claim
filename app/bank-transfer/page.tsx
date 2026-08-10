import type { Metadata } from "next";
import { BankTransferScreen } from "@/components/bank-transfer/BankTransferScreen";
import { PersonaAccessGate } from "@/components/shared/PersonaAccessGate";

export const metadata: Metadata = {
  title: "Bank Transfer | EB+",
  description: "Transfer money from your EB+ balance to a bank account",
};

export default function BankTransferPage() {
  return (
    <PersonaAccessGate requireEbPlus>
      <BankTransferScreen />
    </PersonaAccessGate>
  );
}
