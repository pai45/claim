import { NextResponse } from "next/server";
import { searchMerchantsByName } from "@/lib/merchants/openStreetMap";
import type { BenefitType, MerchantsApiResponse } from "@/lib/merchants/types";

type SearchBody = {
  benefitType?: string;
  query?: string;
};

function isBenefitType(value: unknown): value is BenefitType {
  return value === "meal" || value === "fuel";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchBody;

    if (!isBenefitType(body.benefitType)) {
      return NextResponse.json(
        { results: [], error: "benefitType must be 'meal' or 'fuel'." } satisfies MerchantsApiResponse,
        { status: 400 },
      );
    }

    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json(
        { results: [], error: "query is required." } satisfies MerchantsApiResponse,
        { status: 400 },
      );
    }

    const results = await searchMerchantsByName(body.benefitType, query);
    return NextResponse.json({ results } satisfies MerchantsApiResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Merchant search failed.";
    const status = 502;
    return NextResponse.json(
      { results: [], error: message } satisfies MerchantsApiResponse,
      { status },
    );
  }
}
