import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchFormattedActivity,
  syncActivityRelations,
  type ActivityWriteBody,
} from "@/lib/activities";
import { removeStorageFiles } from "@/lib/storage";

// 1. GET - Read single activity
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const activity = await fetchFormattedActivity(supabase, id);
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message, code: "SERVER_ERROR" }, { status: 500 });
  }
}

// 2. PATCH - Update activity & sync categories, assignments, attachments
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = (await request.json()) as ActivityWriteBody;

    // Build update payload for the activities row
    const updates: Record<string, string | number | null> = {};
    if (typeof body.title === "string") {
      if (!body.title.trim()) {
        return NextResponse.json(
          { error: "Title cannot be empty", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }
    if (typeof body.description === "string") updates.description = body.description;
    if (body.imageSrc !== undefined) updates.image_src = body.imageSrc;
    if (body.imageAlt !== undefined) updates.image_alt = body.imageAlt;

    // Collect files that will become orphaned, before the rows change
    const staleFileUrls: Array<string | null> = [];

    if (body.imageSrc !== undefined) {
      const { data: current, error: currentError } = await supabase
        .from("activities")
        .select("image_src")
        .eq("id", id)
        .maybeSingle();
      if (currentError) {
        return NextResponse.json(
          { error: currentError.message, code: "DATABASE_ERROR" },
          { status: 500 }
        );
      }
      if (current?.image_src && current.image_src !== body.imageSrc) {
        staleFileUrls.push(current.image_src);
      }
    }

    if (Array.isArray(body.removedAttachmentIds) && body.removedAttachmentIds.length > 0) {
      const { data: removedRows, error: removedError } = await supabase
        .from("attachments")
        .select("url")
        .eq("activity_id", id)
        .in("id", body.removedAttachmentIds);
      if (removedError) {
        return NextResponse.json(
          { error: removedError.message, code: "DATABASE_ERROR" },
          { status: 500 }
        );
      }
      staleFileUrls.push(...(removedRows ?? []).map((a) => a.url));
    }

        // The DB trigger can change the id (slug) when the title changes,
    // so track it and use the new id for everything after the update.
    let activityId = id;

    if (Object.keys(updates).length > 0) {
      const { data: updatedRows, error: updateError } = await supabase
        .from("activities")
        .update(updates)
        .eq("id", id)
        .select("id"); // returns the row as the trigger left it, including the new id

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message, code: "DATABASE_ERROR" },
          { status: 500 }
        );
      }

      if (!updatedRows || updatedRows.length === 0) {
        return NextResponse.json(
          {
            error:
              "Activity was not updated. It may not exist, or a row-level security policy is blocking updates.",
            code: "UPDATE_BLOCKED",
          },
          { status: 403 }
        );
      }

      activityId = updatedRows[0].id;
    }

    const syncError = await syncActivityRelations(supabase, activityId, body);
    if (syncError) {
      return NextResponse.json({ error: syncError, code: "DATABASE_ERROR" }, { status: 500 });
    }

    // Database is updated; now remove the replaced image and removed attachments from storage.
    // A failure here leaves orphaned files, not broken data, so report it without failing the request.
    const storageError = await removeStorageFiles(supabase, staleFileUrls);

    // Return the updated formatted activity
    const updated = await fetchFormattedActivity(supabase, activityId);
    if (!updated) {
      return NextResponse.json(
        { error: "Activity not found after update", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ...updated,
        ...(storageError ? { warning: `Storage cleanup incomplete: ${storageError}` } : {}),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message, code: "SERVER_ERROR" }, { status: 500 });
  }
}

// 3. DELETE - Delete activity and its child rows
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Collect file URLs before the rows are deleted
    const { data: activityRow, error: activityFetchError } = await supabase
      .from("activities")
      .select("image_src")
      .eq("id", id)
      .maybeSingle();
    if (activityFetchError) {
      return NextResponse.json(
        { error: activityFetchError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }
    if (!activityRow) {
      return NextResponse.json(
        { error: "Activity not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const { data: attachmentRows, error: attachmentFetchError } = await supabase
      .from("attachments")
      .select("url")
      .eq("activity_id", id);
    if (attachmentFetchError) {
      return NextResponse.json(
        { error: attachmentFetchError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const fileUrls = [activityRow.image_src, ...(attachmentRows ?? []).map((a) => a.url)];

    // Deletes activities and relies on Supabase DELETE ON CASCADE
    const { data: deletedRows, error: deleteError } = await supabase
      .from("activities")
      .delete()
      .eq("id", id)
      .select("id");

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }
    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json(
        { error: "Activity was not deleted. You may not be assigned to it.", code: "DELETE_BLOCKED" },
        { status: 403 }
      );
    }

    // Database rows are gone; now remove the files from storage.
    // A failure here leaves orphaned files, not broken data, so report it without failing the request.
    const storageError = await removeStorageFiles(supabase, fileUrls);

    return NextResponse.json(
      {
        success: true,
        message: "Activity deleted successfully",
        ...(storageError ? { warning: `Storage cleanup incomplete: ${storageError}` } : {}),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message, code: "SERVER_ERROR" }, { status: 500 });
  }
}