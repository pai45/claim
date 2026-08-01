import { NextResponse } from "next/server";
import { searchMerchantsNearby } from "@/lib/merchants/openStreetMap";
import type { BenefitType, MerchantsApiResponse } from "@/lib/merchants/types";

type NearbyBody = {
  benefitType?: string;
  lat?: number;
  lng?: number;
};

function isBenefitType(value: unknown): value is BenefitType {
  return value === "meal" || value === "fuel";
}

function isValidCoord(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NearbyBody;

    if (!isBenefitType(body.benefitType)) {
      return NextResponse.json(
        { results: [], error: "benefitType must be 'meal' or 'fuel'." } satisfies MerchantsApiResponse,
        { status: 400 },
      );
    }

    if (!isValidCoord(body.lat) || !isValidCoord(body.lng)) {
      return NextResponse.json(
        { results: [], error: "lat and lng are required." } satisfies MerchantsApiResponse,
        { status: 400 },
      );
    }

    if (body.lat < -90 || body.lat > 90 || body.lng < -180 || body.lng > 180) {
      return NextResponse.json(
        { results: [], error: "lat/lng out of range." } satisfies MerchantsApiResponse,
        { status: 400 },
      );
    }

    const results = await searchMerchantsNearby(
      body.benefitType,
      body.lat,
      body.lng,
    );
    return NextResponse.json({ results } satisfies MerchantsApiResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nearby merchant search failed.";
    const status = 502;
    return NextResponse.json(
      { results: [], error: message } satisfies MerchantsApiResponse,
      { status },
    );
  }
}
