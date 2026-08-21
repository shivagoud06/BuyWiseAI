import { NextRequest, NextResponse } from "next/server";
import { feedbackStorage } from "@/services/feedback";

/**
 * Public Helpful / Not-Helpful Voting Endpoint
 * Deduplicated per session/client IP
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";

    if (!feedbackStorage.checkRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: "Too many requests." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { feedbackId, vote } = body;

    if (!feedbackId || typeof feedbackId !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid feedbackId is required." },
        { status: 400 }
      );
    }

    if (vote !== "helpful" && vote !== "not_helpful") {
      return NextResponse.json(
        { success: false, error: "Vote must be 'helpful' or 'not_helpful'." },
        { status: 400 }
      );
    }

    const updatedCounts = await feedbackStorage.voteHelpfulness(feedbackId, vote, clientIp);

    if (!updatedCounts) {
      return NextResponse.json(
        { success: false, error: "Feedback item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCounts,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to record vote." },
      { status: 500 }
    );
  }
}
