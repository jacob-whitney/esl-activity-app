import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  fetchFormattedActivity,
  slugify,
  syncActivityRelations,
  type ActivityWriteBody,
} from "@/lib/activities";

// 1. GET - List activities (ordered by sort_order)
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("activities")
      .select("id, title, description, image_src, image_alt, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      (data ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description ?? "",
        imageSrc: a.image_src,
        imageAlt: a.image_alt,
        sortOrder: a.sort_order,
      })),
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message, code: "SERVER_ERROR" }, { status: 500 });
  }
}

// 2. POST - Create an activity (assigned to the signed-in user) with its categories and attachments
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = (await request.json()) as ActivityWriteBody;

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // The creator is the assigned user, so a signed-in session is required
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to create an activity", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // activities.id is text, so build a readable slug (random fallback if empty/taken)
    let id = slugify(body.title) || randomUUID();
    const { data: existing } = await supabase
      .from("activities")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (existing) id = `${id}-${randomUUID().slice(0, 6)}`;

    const { data: inserted, error: insertError } = await supabase
      .from("activities")
      .insert({
        id,
        title: body.title.trim(),
        description: body.description ?? "",
        image_src: body.imageSrc ?? null,
        image_alt: body.imageAlt ?? null,
    })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create activity", code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    // Use the id the database actually stored: the slug trigger may have changed it.
    // The creator is assigned by the on_activity_created trigger, so no assignment insert here.
    id = inserted.id;

    const syncError = await syncActivityRelations(supabase, id, body);
    if (syncError) {
      return NextResponse.json(
        { error: syncError, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const created = await fetchFormattedActivity(supabase, id);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message, code: "SERVER_ERROR" }, { status: 500 });
  }
}