import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissions, insertSubmission } from "@/lib/db";
import { isAuthenticatedRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, details } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters long";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      errors.email = "Please provide a valid email address";
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 5) {
      errors.phone = "Phone number must be at least 5 characters";
    }

    if (!details || typeof details !== "string" || details.trim().length < 2) {
      errors.details = "Please provide details or notes";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, message: "Validation failed" },
        { status: 400 }
      );
    }

    const submission = insertSubmission(name, email, phone, details);

    return NextResponse.json(
      {
        success: true,
        message: "Data submitted successfully",
        data: submission,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Submission insertion error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to save submission to database" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Protect admin data on the server
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access to admin records" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const records = getAllSubmissions(search);

    return NextResponse.json({
      success: true,
      count: records.length,
      submissions: records,
    });
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve submissions" },
      { status: 500 }
    );
  }
}
