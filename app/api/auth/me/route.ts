import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ session });
  } catch (err) {
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}
