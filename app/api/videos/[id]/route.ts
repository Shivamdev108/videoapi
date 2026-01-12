import { NextRequest, NextResponse } from "next/server";
import { getVideoById, updateVideo, deleteVideo } from "@/lib/video-storage";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const video = await getVideoById(id);

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch video." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      title?: string;
      description?: string;
    };

    const video = await updateVideo(id, body);

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update video." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteVideo(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Video deleted." });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete video." },
      { status: 500 },
    );
  }
}

