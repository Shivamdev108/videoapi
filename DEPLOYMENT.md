# Vercel Deployment Guide

## Step-by-Step Instructions

### 1. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

Follow the prompts:
- Set up and deploy: **Yes**
- Which scope: Select your account
- Link to existing project: **No**
- Project name: **videoapi** (or your preferred name)
- Directory: **./
** (press Enter)
- Override settings: **No**

### 2. Set Up Vercel Blob Storage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **videoapi** project
3. Click on the **Storage** tab
4. Click **Create Database**
5. Select **Blob**
6. Choose a name (e.g., `video-storage`)
7. Click **Create**

✅ Environment variables are automatically added to your project!

### 3. Set Up Vercel KV (Redis)

1. In the same **Storage** tab
2. Click **Create Database** again
3. Select **KV**
4. Choose a name (e.g., `video-metadata`)
5. Select a region close to your users
6. Click **Create**

✅ Environment variables are automatically added to your project!

### 4. Redeploy

After setting up storage, redeploy to production:

```bash
vercel --prod
```

### 5. Test Your API

Your API will be available at: `https://your-project.vercel.app`

**Test endpoints:**

```bash
# List videos
curl https://your-project.vercel.app/api/videos

# Upload a video
curl -X POST https://your-project.vercel.app/api/upload \
  -F "video=@/path/to/video.mp4" \
  -F "title=My Video" \
  -F "description=This is a test video"
```

## Important Notes

### File Size Limits

- **Free tier:** 4.5 MB per file
- **Pro tier:** 500 MB per file
- **Enterprise:** Custom limits

If you need larger files, upgrade your Vercel plan.

### Storage Pricing

**Vercel Blob:**
- Free: 500 MB storage
- Pro: 100 GB included, then $0.15/GB

**Vercel KV:**
- Free: 256 MB storage, 3,000 commands/day
- Pro: 512 MB included, 100,000 commands/day

### Environment Variables

The following are automatically set when you create storage:

**Blob:**
- `BLOB_READ_WRITE_TOKEN`

**KV:**
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

You can view them in: **Project Settings → Environment Variables**

## Troubleshooting

### Error: "Failed to upload video"

**Cause:** Storage not configured

**Solution:**
1. Make sure you've created both Blob and KV storage
2. Check that environment variables are set in Vercel dashboard
3. Redeploy after adding storage

### Error: "KV_URL is not defined"

**Cause:** KV storage not connected

**Solution:**
1. Go to Storage tab in Vercel
2. Create a KV database
3. Redeploy

### Videos not appearing in list

**Cause:** Metadata not syncing

**Solution:**
1. Check Vercel logs for errors
2. Verify KV storage is working
3. Try uploading a new video

## Monitoring

View logs in real-time:

```bash
vercel logs --follow
```

Or check logs in Vercel Dashboard:
**Project → Deployments → [Latest] → Logs**

## Next Steps

- Set up custom domain
- Add authentication
- Implement video transcoding
- Add video thumbnails
- Set up CDN caching

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
