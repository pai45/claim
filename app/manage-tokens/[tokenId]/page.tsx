import { TokenDetails } from "@/components/manage-tokens/TokenDetails";

export default async function TokenDetailsPage({ params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  return (
    <main className="min-h-dvh w-full">
      <TokenDetails tokenId={tokenId} />
    </main>
  );
}
