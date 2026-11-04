import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - List user profiles (used for assigning users to activities)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email")
      .order("email", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message, code: "SERVER_ERROR" }, { status: 500 });
  }
}