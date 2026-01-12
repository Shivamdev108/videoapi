import { NextRequest, NextResponse } from "next/server";
import {
  getAllVideos,
  createVideo,
  type VideoMetadata,
} from "@/lib/video-storage";

export const runtime = "nodejs";

function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl(request);
    const videos = await getAllVideos(baseUrl);

    // Return only title, description, and url
    const filteredVideos = videos.map(video => ({
      title: video.title,
      description: video.description,
      url: video.url,
    }));

    return NextResponse.json({ success: true, videos: filteredVideos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch videos.",
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title: string;
      description: string;
      fileName: string;
      storedPath: string;
    };

    if (!body.title || !body.description || !body.fileName || !body.storedPath) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: title, description, fileName, storedPath",
        },
        { status: 400 },
      );
    }

    const baseUrl = getBaseUrl(request);
    const video = await createVideo(
      body.title,
      body.description,
      body.fileName,
      body.storedPath,
      baseUrl,
    );

    return NextResponse.json({ success: true, video }, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create video." },
      { status: 500 },
    );
  }
}

