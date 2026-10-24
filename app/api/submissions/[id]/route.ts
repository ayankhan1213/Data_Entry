import { NextRequest, NextResponse } from "next/server";
import { deleteSubmission, getSubmissionById } from "@/lib/db";
import { isAuthenticatedRequest } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Server-side authentication check
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID parameter" },
        { status: 400 }
      );
    }

    const existing = getSubmissionById(numId);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    const deleted = deleteSubmission(numId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Failed to delete submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Record #${numId} deleted successfully`,
    });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { success: false, message: "Server error deleting submission" },
      { status: 500 }
    );
  }
}
