import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createVideo } from "@/lib/video-storage";

export const runtime = "nodejs";

function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
}

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filePath = path.join(
      uploadsDir,
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`,
    );

    await writeFile(filePath, buffer);

    // Create video metadata entry
    const baseUrl = getBaseUrl(request);
    // Extract the actual stored filename from the path
    const storedFileName = path.basename(filePath);
    const video = await createVideo(
      title.trim(),
      description.trim() || "No description provided.",
      storedFileName,
      filePath,
      baseUrl,
    );

    return NextResponse.json({
      success: true,
      message: "Video uploaded successfully.",
      video,
    });
  } catch (error) {
    console.error("Error saving uploaded video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload video." },
      { status: 500 },
    );
  }
}


