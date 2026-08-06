import { Suspense } from "react";
import type { Metadata } from "next";
import { UpiSettingsScreen } from "@/components/upi-settings/UpiSettingsScreen";

export const metadata: Metadata = {
  title: "UPI Settings",
};

export default function UpiSettingsPage() {
  return (
    <main className="min-h-dvh w-full">
      <Suspense
        fallback={
          <div className="mx-auto h-dvh w-full max-w-phone bg-white" />
        }
      >
        <UpiSettingsScreen />
      </Suspense>
    </main>
  );
}
