"use client";

import React, { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { UploadIcon, ShieldCheckIcon } from "@/components/Icons";

interface UploadedAsset {
  _id: string;
  cloudinaryPublicId: string;
  cloudinaryVersion: string;
  resourceType: "image" | "video";
  phase: string;
  aiTags: string[];
  aiCaption?: string;
  geo?: { lat: number; lng: number };
  provenanceHash?: string;
  capturedAt?: string;
  createdAt: string;
  url: string;
  thumbnailUrl: string;
}

interface UploadZoneProps {
  projectId: string;
  phase: string;
  onUploadComplete: (asset: UploadedAsset) => void;
}

export function UploadZone({ projectId, phase, onUploadComplete }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<
    {
      id: string;
      name: string;
      progress: number;
      status: "uploading" | "processing" | "done" | "error";
      error?: string;
      asset?: UploadedAsset;
    }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const acceptedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "image/avif",
        "video/mp4",
        "video/quicktime",
        "video/webm",
      ];

      for (const file of fileArray) {
        if (!acceptedTypes.includes(file.type) && !file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          continue;
        }

        const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const uploadEntry = {
          id: uploadId,
          name: file.name,
          progress: 0,
          status: "uploading" as const,
        };

        setUploads((prev) => [uploadEntry, ...prev]);

        // Upload the file
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", projectId);
          formData.append("phase", phase);

          // Simulate upload progress via XMLHttpRequest for progress tracking
          const result = await new Promise<UploadedAsset>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/upload");

            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploads((prev) =>
                  prev.map((u) =>
                    u.id === uploadId
                      ? { ...u, progress: Math.min(percent, 95) }
                      : u
                  )
                );
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  if (data.success && data.asset) {
                    resolve(data.asset);
                  } else {
                    reject(new Error(data.error || "Upload failed"));
                  }
                } catch {
                  reject(new Error("Invalid server response"));
                }
              } else {
                try {
                  const data = JSON.parse(xhr.responseText);
                  reject(new Error(data.error || `Upload failed (${xhr.status})`));
                } catch {
                  reject(new Error(`Upload failed (${xhr.status})`));
                }
              }
            });

            xhr.addEventListener("error", () => reject(new Error("Network error")));
            xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

            xhr.send(formData);
          });

          // Mark as processing briefly, then done
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { ...u, progress: 100, status: "processing" as const }
                : u
            )
          );

          // Small delay to show processing state
          await new Promise((r) => setTimeout(r, 500));

          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { ...u, status: "done" as const, asset: result }
                : u
            )
          );

          onUploadComplete(result);
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? {
                    ...u,
                    status: "error" as const,
                    error:
                      error instanceof Error
                        ? error.message
                        : "Upload failed",
                  }
                : u
            )
          );
        }
      }
    },
    [projectId, phase, onUploadComplete]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const activeUploads = uploads.filter(
    (u) => u.status === "uploading" || u.status === "processing"
  );
  const completedUploads = uploads.filter(
    (u) => u.status === "done" || u.status === "error"
  );

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragOver ? "#6B8F6E" : "rgba(154, 167, 157, 0.2)",
          backgroundColor: isDragOver
            ? "rgba(63, 90, 68, 0.15)"
            : "rgba(23, 27, 24, 0.6)",
        }}
        transition={{ duration: 0.2, ease: BRAND_EASING }}
        className="relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center flex flex-col items-center justify-center group overflow-hidden"
      >
        {/* Grain overlay */}
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-60" />

        <motion.div
          animate={{
            scale: isDragOver ? 1.15 : 1,
            y: isDragOver ? -4 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 w-14 h-14 rounded-xl bg-ink border border-mist/20 flex items-center justify-center mb-4 group-hover:border-moss/40 transition-colors"
        >
          <UploadIcon
            size={28}
            className={`transition-colors ${
              isDragOver ? "text-moss-bright" : "text-mist"
            } group-hover:text-moss-bright`}
          />
        </motion.div>

        <h3 className="relative z-10 font-display text-lg text-bone mb-1">
          {isDragOver ? "Drop to upload" : "Drag & drop field media"}
        </h3>
        <p className="relative z-10 font-sans text-mist text-xs max-w-sm leading-relaxed">
          Upload images and videos to fingerprint provenance and extract EXIF
          telemetry. Supports JPEG, PNG, WebP, HEIC, MP4, WebM.
        </p>

        <div className="relative z-10 mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink-soft border border-mist/15 text-xs text-mist group-hover:border-moss/30 group-hover:text-bone transition-all">
          <span>or tap to browse files</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>

      {/* Active Upload Progress */}
      <AnimatePresence mode="popLayout">
        {activeUploads.map((upload) => (
          <motion.div
            key={upload.id}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: BRAND_EASING }}
            className="rounded-xl bg-ink-soft border border-mist/15 p-4 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-ink border border-mist/20 flex items-center justify-center shrink-0">
                  {upload.status === "processing" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <ShieldCheckIcon size={16} className="text-clay" />
                    </motion.div>
                  ) : (
                    <UploadIcon size={16} className="text-moss-bright" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-xs text-bone truncate">
                    {upload.name}
                  </p>
                  <p className="font-mono text-[10px] text-mist">
                    {upload.status === "processing"
                      ? "Computing provenance hash..."
                      : `Uploading — ${upload.progress}%`}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-moss-bright shrink-0">
                {upload.progress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 rounded-full bg-ink overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${upload.progress}%` }}
                transition={{ duration: 0.3, ease: BRAND_EASING }}
                style={{
                  background:
                    upload.status === "processing"
                      ? "linear-gradient(90deg, #D98E4A, #6B8F6E)"
                      : "linear-gradient(90deg, #3F5A44, #6B8F6E)",
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Completed uploads (show errors, success count) */}
      {completedUploads.length > 0 && (
        <div className="space-y-2">
          {completedUploads
            .filter((u) => u.status === "error")
            .map((upload) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-clay/10 border border-clay/30 p-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="font-sans text-xs text-bone truncate">
                    {upload.name}
                  </p>
                  <p className="font-mono text-[10px] text-clay">
                    {upload.error}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setUploads((prev) =>
                      prev.filter((u) => u.id !== upload.id)
                    )
                  }
                  className="text-mist hover:text-bone text-xs ml-3 shrink-0"
                >
                  Dismiss
                </button>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
