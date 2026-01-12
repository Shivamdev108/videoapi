import { readFile, writeFile, readdir, stat, access, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export type VideoMetadata = {
  id: string;
  title: string;
  description: string;
  url: string;
  fileName: string;
  storedPath: string;
  uploadedAt: string;
};

const METADATA_FILE = path.join(process.cwd(), "data", "videos.json");

async function ensureDataDir() {
  const dataDir = path.dirname(METADATA_FILE);
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

async function readMetadata(): Promise<VideoMetadata[]> {
  try {
    await ensureDataDir();
    if (!existsSync(METADATA_FILE)) {
      return [];
    }
    const content = await readFile(METADATA_FILE, "utf-8");
    return JSON.parse(content) as VideoMetadata[];
  } catch (error) {
    console.error("Error reading video metadata:", error);
    return [];
  }
}

async function writeMetadata(videos: VideoMetadata[]): Promise<void> {
  try {
    await ensureDataDir();
    await writeFile(METADATA_FILE, JSON.stringify(videos, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing video metadata:", error);
    throw error;
  }
}

// Normalize path for comparison (handles Windows/Unix path differences)
function normalizePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, "/");
}

export async function syncExistingVideos(baseUrl: string): Promise<VideoMetadata[]> {
  let existingVideos: VideoMetadata[] = [];

  try {
    existingVideos = await readMetadata();
  } catch (readError) {
    console.error("Error reading metadata in sync:", readError);
    existingVideos = [];
  }

  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      return existingVideos;
    }

    // Normalize paths for comparison
    const existingPaths = new Set(
      existingVideos.map((v) => {
        try {
          return normalizePath(v.storedPath);
        } catch {
          return v.storedPath;
        }
      })
    );

    let files: string[] = [];
    try {
      files = await readdir(uploadsDir);
    } catch (readdirError) {
      console.error("Error reading uploads directory:", readdirError);
      return existingVideos;
    }

    const videoFiles = files.filter((file) => {
      try {
        const ext = path.extname(file).toLowerCase();
        return [".mp4", ".mov", ".webm", ".avi", ".mkv", ".flv", ".wmv"].includes(ext);
      } catch {
        return false;
      }
    });

    const newVideos: VideoMetadata[] = [];

    for (const file of videoFiles) {
      try {
        const filePath = path.join(uploadsDir, file);
        const normalizedPath = normalizePath(filePath);

        if (existingPaths.has(normalizedPath)) {
          continue; // Already in metadata
        }

        // Get file stats for upload time
        let uploadedAt: Date = new Date();
        try {
          const stats = await stat(filePath);
          // Use birthtime if available, otherwise use mtime (modification time)
          if ((stats as any).birthtime && (stats as any).birthtime.getTime() !== 0) {
            uploadedAt = (stats as any).birthtime;
          } else {
            uploadedAt = stats.mtime;
          }
        } catch (statError) {
          // If stat fails, use current time (already set)
        }

        // Use filename (without extension) as the title
        const fileNameWithoutExt = path.basename(file, path.extname(file));
        const title = fileNameWithoutExt;

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        // Create URL pointing to the actual video file
        const url = `${baseUrl}/api/uploads/${file}`;

        const video: VideoMetadata = {
          id,
          title: title || "Untitled Video",
          description: "Video imported from uploads folder",
          url,
          fileName: file,
          storedPath: filePath,
          uploadedAt: uploadedAt.toISOString(),
        };

        newVideos.push(video);
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError);
        // Continue with next file
        continue;
      }
    }

    if (newVideos.length > 0) {
      try {
        const allVideos = [...existingVideos, ...newVideos];
        await writeMetadata(allVideos);
        return allVideos;
      } catch (writeError) {
        console.error("Error writing metadata:", writeError);
        // Return existing videos even if write fails
        return existingVideos;
      }
    }

    return existingVideos;
  } catch (error) {
    console.error("Error syncing existing videos:", error);
    return existingVideos;
  }
}

export async function getAllVideos(baseUrl?: string): Promise<VideoMetadata[]> {
  try {
    // If baseUrl is provided, sync existing files
    if (baseUrl) {
      return await syncExistingVideos(baseUrl);
    }
    return await readMetadata();
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    // Fallback to just reading metadata
    try {
      return await readMetadata();
    } catch (readError) {
      console.error("Error reading metadata:", readError);
      return [];
    }
  }
}

export async function getVideoById(id: string): Promise<VideoMetadata | null> {
  const videos = await readMetadata();
  return videos.find((v) => v.id === id) ?? null;
}

export async function createVideo(
  title: string,
  description: string,
  fileName: string,
  storedPath: string,
  baseUrl: string,
): Promise<VideoMetadata> {
  const videos = await readMetadata();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  // Use the same URL format as synced videos
  const url = `${baseUrl}/api/uploads/${fileName}`;
  const video: VideoMetadata = {
    id,
    title,
    description,
    url,
    fileName,
    storedPath,
    uploadedAt: new Date().toISOString(),
  };

  videos.push(video);
  await writeMetadata(videos);
  return video;
}

export async function updateVideo(
  id: string,
  updates: Partial<Pick<VideoMetadata, "title" | "description">>,
): Promise<VideoMetadata | null> {
  const videos = await readMetadata();
  const index = videos.findIndex((v) => v.id === id);
  if (index === -1) {
    return null;
  }

  videos[index] = { ...videos[index], ...updates };
  await writeMetadata(videos);
  return videos[index];
}

export async function deleteVideo(id: string): Promise<boolean> {
  const videos = await readMetadata();
  const index = videos.findIndex((v) => v.id === id);
  if (index === -1) {
    return false;
  }

  videos.splice(index, 1);
  await writeMetadata(videos);
  return true;
}

