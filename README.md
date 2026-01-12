# Video API

A Next.js-based video upload and management API designed for deployment on Vercel.

## Features

- Upload videos via API
- List all uploaded videos
- Videos stored in Vercel Blob Storage
- Metadata stored in Vercel KV (Redis)
- Serverless and scalable

## API Endpoints

### GET `/api/videos`
Returns a list of all uploaded videos.

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "title": "Video Title",
      "description": "Video Description",
      "url": "https://blob.vercel-storage.com/..."
    }
  ]
}
```

### POST `/api/upload`
Upload a new video.

**Request (multipart/form-data):**
- `video`: Video file
- `title`: Video title (required)
- `description`: Video description (optional)

**Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully.",
  "video": {
    "id": "...",
    "title": "Video Title",
    "description": "Video Description",
    "url": "https://blob.vercel-storage.com/...",
    "fileName": "video.mp4",
    "uploadedAt": "2026-01-12T10:00:00.000Z"
  }
}
```

## Deployment on Vercel

### Prerequisites
1. A Vercel account
2. Vercel CLI installed: `npm i -g vercel`

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shivamdev108/videoapi.git
   cd videoapi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```

4. **Set up Vercel Blob Storage:**
   - Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to **Storage** tab
   - Click **Create Database**
   - Select **Blob**
   - Follow the setup wizard
   - The environment variables will be automatically added to your project

5. **Set up Vercel KV (Redis):**
   - In the same **Storage** tab
   - Click **Create Database** again
   - Select **KV**
   - Follow the setup wizard
   - The environment variables will be automatically added to your project

6. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Environment Variables

The following environment variables are automatically set by Vercel when you create the storage:

**Vercel Blob:**
- `BLOB_READ_WRITE_TOKEN`

**Vercel KV:**
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Local Development

For local development, you'll need to create a `.env.local` file with the Vercel storage credentials:

1. **Get your credentials from Vercel:**
   - Go to your project settings
   - Navigate to **Storage** tab
   - Click on your Blob and KV databases
   - Copy the environment variables

2. **Create `.env.local`:**
   ```env
   BLOB_READ_WRITE_TOKEN=your_blob_token
   KV_URL=your_kv_url
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Tech Stack

- **Framework:** Next.js 15
- **Runtime:** Node.js
- **Storage:** Vercel Blob (for video files)
- **Database:** Vercel KV (for metadata)
- **Deployment:** Vercel

## File Structure

```
video-api/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts      # Upload endpoint
│   │   └── videos/
│   │       └── route.ts      # List videos endpoint
│   └── ...
├── lib/
│   └── video-storage-vercel.ts  # Storage logic
├── .env.local                # Local environment variables
└── README.md
```

## Notes

- Maximum file size for Vercel Blob on the free tier is 4.5 MB per file
- For larger files, consider upgrading to Vercel Pro
- Videos are publicly accessible via their Blob URLs
- Metadata is stored in Redis (Vercel KV) for fast retrieval

## License

MIT
