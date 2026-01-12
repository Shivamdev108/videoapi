import { NextRequest, NextResponse } from "next/server";
import { createVideo } from "@/lib/video-storage-vercel";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video");
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No video file provided." },
        { status: 400 },
      );
    }

    if (!title.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required." },
        { status: 400 },
      );
    }

    // Upload to Vercel Blob and save metadata to KV
    const video = await createVideo(
      title.trim(),
      description.trim() || "No description provided.",
      file,
    );

    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully.",
      video,
    });
  } catch (error) {
    console.error("Error saving uploaded video:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload video.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    );
  }
}
