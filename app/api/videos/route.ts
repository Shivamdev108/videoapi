import { NextRequest, NextResponse } from "next/server";
import { getAllVideos } from "@/lib/video-storage-vercel";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const videos = await getAllVideos();

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
