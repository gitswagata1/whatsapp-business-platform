import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, organizationName } = await req.json();
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    const user = await register(name, email, password, organizationName);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 }
    );
  }
}
