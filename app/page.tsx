/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useRef, useState } from "react";

type UploadStatus = {
  type: "idle" | "uploading" | "success" | "error";
  message?: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<UploadStatus>({ type: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setStatus({ type: "error", message: "Please select a video file." });
      return;
    }

    if (!title.trim()) {
      setStatus({ type: "error", message: "Please enter a title." });
      return;
    }

    try {
      setStatus({ type: "uploading", message: "Uploading video..." });

      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
        video?: { id: string; url: string; title: string };
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Upload failed.");
      }

      setStatus({
        type: "success",
        message: data.video
          ? `Video "${data.video.title}" uploaded successfully! URL: ${data.video.url}`
          : data.message ?? "Video uploaded successfully.",
      });
      setFile(null);
      setTitle("");
      setDescription("");
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while uploading.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Upload a video
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Choose a video file from your computer and upload it. The video will
            be saved on the server in a writable folder.
          </p>
        </header>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setStatus({ type: "idle" });
              }}
              placeholder="Enter video title"
              className="block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setStatus({ type: "idle" });
              }}
              placeholder="Enter video description (optional)"
              rows={3}
              className="block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="video"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Video file <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                id="video"
                name="video"
                type="file"
                accept="video/*"
                required
                className="block w-full cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-50 hover:file:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null;
                  setFile(selectedFile);
                  setStatus({ type: "idle" });
                }}
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Supported: common video formats (mp4, mov, webm, etc.).
            </p>
          </div>

          <button
            type="submit"
            disabled={status.type === "uploading"}
            className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {status.type === "uploading" ? "Uploading..." : "Upload video"}
          </button>
        </form>

        {status.type !== "idle" && status.message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
            }`}
          >
            {status.message}
          </div>
        )}

        <footer className="text-xs text-zinc-500 dark:text-zinc-500">
          The uploaded files are stored on the server filesystem. Make sure your
          deployment environment allows writing to disk.
        </footer>
      </div>
    </div>
  );
}
