import { NextResponse } from "next/server";
import { resolveAssistantReply } from "@/lib/assistant/engine";
import type { ChatRequest, ChatResponse } from "@/features/chat/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const message = typeof body.message === "string" ? body.message : "";
    const intentId =
      typeof body.intentId === "string" ? body.intentId : undefined;

    if (!message.trim() && !intentId) {
      return NextResponse.json(
        { error: "message or intentId is required" },
        { status: 400 },
      );
    }

    const result = resolveAssistantReply(message, intentId);
    const response: ChatResponse = {
      reply: result.reply,
      intentId: result.intentId,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
