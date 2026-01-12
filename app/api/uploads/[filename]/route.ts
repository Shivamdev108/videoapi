import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

export const runtime = "nodejs";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        const filePath = path.join(process.cwd(), "uploads", filename);

        // Check if file exists
        if (!existsSync(filePath)) {
            return NextResponse.json(
                { success: false, message: "Video not found" },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await readFile(filePath);

        // Determine content type based on file extension
        const ext = path.extname(filename).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mov": "video/quicktime",
            ".avi": "video/x-msvideo",
            ".mkv": "video/x-matroska",
            ".flv": "video/x-flv",
            ".wmv": "video/x-ms-wmv",
        };

        const contentType = contentTypeMap[ext] || "application/octet-stream";

        // Return the video file
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": fileBuffer.length.toString(),
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch (error) {
        console.error("Error serving video:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return NextResponse.json(
            {
                success: false,
                message: "Failed to serve video",
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
