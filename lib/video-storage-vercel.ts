import { put, list, del, head } from "@vercel/blob";

export type VideoMetadata = {
    id: string;
    title: string;
    description: string;
    url: string;
    fileName: string;
    uploadedAt: string;
};

const METADATA_FILE = "metadata/videos.json";

// Get all videos from Blob storage
export async function getAllVideos(): Promise<VideoMetadata[]> {
    try {
        // Try to get the metadata file from Blob
        const metadataBlob = await list({
            prefix: METADATA_FILE,
            limit: 1,
        });

        if (metadataBlob.blobs.length === 0) {
            return [];
        }

        // Fetch the metadata file content
        const response = await fetch(metadataBlob.blobs[0].url);
        const videos = await response.json();
        return videos as VideoMetadata[];
    } catch (error) {
        console.error("Error reading video metadata:", error);
        return [];
    }
}

// Save videos metadata to Blob storage
async function saveMetadata(videos: VideoMetadata[]): Promise<void> {
    try {
        // Delete old metadata file if it exists
        try {
            const existingBlobs = await list({
                prefix: METADATA_FILE,
                limit: 1,
            });

            if (existingBlobs.blobs.length > 0) {
                await del(existingBlobs.blobs[0].url);
            }
        } catch (deleteError) {
            // Ignore delete errors, file might not exist
            console.log("No existing metadata to delete");
        }

        // Create new metadata file
        const jsonContent = JSON.stringify(videos, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });

        await put(METADATA_FILE, blob, {
            access: "public",
            addRandomSuffix: false,
            contentType: "application/json",
        });
    } catch (error) {
        console.error("Error saving video metadata:", error);
        throw error;
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

        // Upload video to Vercel Blob
        const blob = await put(`videos/${id}-${file.name}`, file, {
            access: "public",
            addRandomSuffix: true,
        });

        const video: VideoMetadata = {
            id,
            title,
            description,
            url: blob.url,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
        };

        // Save metadata
        const videos = await getAllVideos();
        videos.push(video);
        await saveMetadata(videos);

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
        await saveMetadata(videos);

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
        await saveMetadata(updatedVideos);

        return true;
    } catch (error) {
        console.error("Error deleting video:", error);
        return false;
    }
}
