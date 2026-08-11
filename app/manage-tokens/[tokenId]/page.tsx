import { TokenDetails } from "@/components/manage-tokens/TokenDetails";

const TOKEN_IDS = [
  "apple-pay-1",
  "google-pay-1",
  "amazon-1",
  "netflix-1",
  "spotify-1",
] as const;

export function generateStaticParams() {
  return TOKEN_IDS.map((tokenId) => ({ tokenId }));
}

export default async function TokenDetailsPage({ params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  return (
    <main className="min-h-dvh w-full">
      <TokenDetails tokenId={tokenId} />
    </main>
  );
}
