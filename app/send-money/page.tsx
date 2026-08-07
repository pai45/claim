import type { Metadata } from "next";
import { PayUpiScreen } from "@/components/send-money/PayUpiScreen";

export const metadata: Metadata = {
  title: "Pay to UPI ID | PlusPay",
  description: "Send money instantly to any UPI ID or recently paid contacts",
};

export default function SendMoneyPage() {
  return <PayUpiScreen />;
}
