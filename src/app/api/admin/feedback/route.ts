import { NextRequest, NextResponse } from "next/server";
import { feedbackStorage, FeedbackStatus } from "@/services/feedback";

function verifyAdminAuth(request: NextRequest): boolean {
  const expectedSecret =
    process.env.ADMIN_SECRET_KEY || process.env.ADMIN_API_KEY || "buywise-admin-secret";

  const adminHeader = request.headers.get("x-admin-key");
  const authHeader = request.headers.get("authorization");

  if (adminHeader && adminHeader.trim() === expectedSecret) {
    return true;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token === expectedSecret) {
      return true;
    }
  }

  // Check query parameter as optional convenience for admin UI sessions
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("adminKey");
  if (queryKey && queryKey.trim() === expectedSecret) {
    return true;
  }

  return false;
}

/**
 * Admin Feedback List Endpoint (Protected)
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Valid admin credentials required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as FeedbackStatus | "ALL" | null;

    const feedbackList = await feedbackStorage.getAllFeedback(status || "ALL");

    return NextResponse.json({
      success: true,
      data: feedbackList,
      total: feedbackList.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve admin feedback." },
      { status: 500 }
    );
  }
}

/**
 * Admin Feedback Moderation Status Updater (Protected)
 */
export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Valid admin credentials required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Feedback ID is required." },
        { status: 400 }
      );
    }

    if (status !== "APPROVED" && status !== "REJECTED" && status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Status must be 'APPROVED', 'REJECTED', or 'PENDING'." },
        { status: 400 }
      );
    }

    const updated = await feedbackStorage.updateFeedbackStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Feedback item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Feedback ${id} status updated to ${status}.`,
      id,
      status,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update feedback status." },
      { status: 500 }
    );
  }
}
