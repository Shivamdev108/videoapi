import { put, list, del } from "@vercel/blob";
import { kv } from "@vercel/kv";

export type VideoMetadata = {
    id: string;
    title: string;
    description: string;
    url: string;
    fileName: string;
    uploadedAt: string;
};

const VIDEOS_KEY = "videos:all";

// Get all videos from KV store
export async function getAllVideos(): Promise<VideoMetadata[]> {
    try {
        const videos = await kv.get<VideoMetadata[]>(VIDEOS_KEY);
        return videos || [];
    } catch (error) {
        console.error("Error reading video metadata:", error);
        return [];
    }
}

// Get video by ID
export async function getVideoById(id: string): Promise<VideoMetadata | null> {
    try {
        const videos = await getAllVideos();
        return videos.find((v) => v.id === id) ?? null;
    } catch (error) {
        console.error("Error getting video by ID:", error);
        return null;
    }
}

// Create/upload a video
export async function createVideo(
    title: string,
    description: string,
    file: File,
): Promise<VideoMetadata> {
    try {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        // Upload to Vercel Blob
        const blob = await put(`videos/${id}-${file.name}`, file, {
            access: "public",
            addRandomSuffix: false,
        });

        const video: VideoMetadata = {
            id,
            title,
            description,
            url: blob.url,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
        };

        // Save metadata to KV
        const videos = await getAllVideos();
        videos.push(video);
        await kv.set(VIDEOS_KEY, videos);

        return video;
    } catch (error) {
        console.error("Error creating video:", error);
        throw error;
    }
}

// Update video metadata
export async function updateVideo(
    id: string,
    updates: Partial<Pick<VideoMetadata, "title" | "description">>,
): Promise<VideoMetadata | null> {
    try {
        const videos = await getAllVideos();
        const index = videos.findIndex((v) => v.id === id);

        if (index === -1) {
            return null;
        }

        videos[index] = { ...videos[index], ...updates };
        await kv.set(VIDEOS_KEY, videos);

        return videos[index];
    } catch (error) {
        console.error("Error updating video:", error);
        return null;
    }
}

// Delete video
export async function deleteVideo(id: string): Promise<boolean> {
    try {
        const videos = await getAllVideos();
        const video = videos.find((v) => v.id === id);

        if (!video) {
            return false;
        }

        // Delete from Blob storage
        try {
            await del(video.url);
        } catch (blobError) {
            console.error("Error deleting blob:", blobError);
            // Continue even if blob deletion fails
        }

        // Remove from metadata
        const updatedVideos = videos.filter((v) => v.id !== id);
        await kv.set(VIDEOS_KEY, updatedVideos);

        return true;
    } catch (error) {
        console.error("Error deleting video:", error);
        return false;
    }
}
