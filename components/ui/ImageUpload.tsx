"use client";

import { useEffect, useRef, useTransition } from "react";
import { Camera, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type ImageUploadProps = {
  /** Current image URL (controlled). */
  value?: string;
  /** Called with the public URL after a successful upload. */
  onChange: (url: string) => void;
  /** Supabase storage bucket to upload into. */
  bucket: string;
  /** Icon shown when there is no image yet. */
  icon?: LucideIcon;
  /** Label shown over the image while uploading. */
  uploadingLabel?: string;
  /** Toast message shown when the upload fails. */
  errorLabel?: string;
  /** Notified whenever an upload starts/finishes (e.g. to disable a submit button). */
  onUploadingChange?: (uploading: boolean) => void;
  className?: string;
  disabled?: boolean;
};

function ImageUpload({
  value,
  onChange,
  bucket,
  icon: Icon = Camera,
  uploadingLabel = "Uploading…",
  errorLabel = "Upload failed",
  onUploadingChange,
  className,
  disabled,
}: ImageUploadProps) {
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startUpload(async () => {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) {
        toast.error(errorLabel);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className={cn(
          "relative w-20 h-20 rounded-xl border-2 border-dashed border-[var(--hairline)] hover:border-[var(--accent)] transition-colors overflow-hidden flex items-center justify-center bg-[var(--accent-soft)]",
          className
        )}
      >
        {value
          ? <img src={value} alt="" className="w-full h-full object-cover" />
          : <Icon className="w-6 h-6 text-[var(--muted)]" />}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-medium">{uploadingLabel}</span>
          </div>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

export { ImageUpload };
