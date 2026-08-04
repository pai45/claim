"use client";

import { useRef, type ChangeEvent, type ReactNode } from "react";
import type { UploadOptionId } from "@/features/chat/types";
import { colors } from "@/lib/ui/colors";

type UploadOptionsCardProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
};

function BookmarkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M6.25 3.5h9.5a1.25 1.25 0 0 1 1.25 1.25v13.6l-6-3.45-6 3.45V4.75A1.25 1.25 0 0 1 6.25 3.5Z"
        stroke={colors.pine}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="7"
        width="20"
        height="15"
        rx="3"
        stroke={colors.pine}
        strokeWidth="1.6"
      />
      <circle cx="14" cy="14.5" r="4" stroke={colors.pine} strokeWidth="1.6" />
      <path
        d="M10 7l1.2-2h5.6L18 7"
        stroke={colors.pine}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M8 4h8l5 5v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        stroke={colors.pine}
        strokeWidth="1.6"
      />
      <path d="M16 4v5h5" stroke={colors.pine} strokeWidth="1.6" />
      <path
        d="M10 14h8M10 17.5h5"
        stroke={colors.pine}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="6"
        width="20"
        height="16"
        rx="2.5"
        stroke={colors.pine}
        strokeWidth="1.6"
      />
      <circle cx="10" cy="12" r="2" stroke={colors.pine} strokeWidth="1.4" />
      <path
        d="M4.5 18.5l5.5-5 4 3.5 3-2.5 6.5 4.5"
        stroke={colors.pine}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const OPTIONS: {
  id: UploadOptionId;
  label: string;
  accept: string;
  capture?: boolean;
  icon: ReactNode;
}[] = [
  {
    id: "camera",
    label: "Take photo",
    accept: "image/*",
    capture: true,
    icon: <CameraIcon />,
  },
  {
    id: "pdf",
    label: "Upload PDF",
    accept: "application/pdf",
    icon: <PdfIcon />,
  },
  {
    id: "gallery",
    label: "Choose from gallery",
    accept: "image/*",
    icon: <GalleryIcon />,
  },
];

export function UploadOptionsCard({
  onFileSelected,
  disabled,
  title = "Upload options",
  subtitle = "PDF, JPG or PNG up to 10 MB",
}: UploadOptionsCardProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const refs = {
    camera: cameraRef,
    pdf: pdfRef,
    gallery: galleryRef,
  } as const;

  function handlePick(optionId: UploadOptionId) {
    if (disabled) return;
    refs[optionId].current?.click();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onFileSelected(file);
  }

  return (
    <div className="w-full max-w-card rounded-[28px] border-2 border-[#8dceb0] bg-white p-5 shadow-card">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-control bg-surface-tint">
          <BookmarkIcon />
        </div>
        <div className="min-w-0 pt-1">
          <h3 className="type-section-title text-pine">
            {title}
          </h3>
          <p className="mt-0.5 type-body-secondary text-subtle">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => handlePick(option.id)}
            className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-[18px] border border-input-border bg-white px-2 py-4 text-center shadow-soft transition-colors hover:border-success disabled:opacity-50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-tint">
              {option.icon}
            </span>
            <span className="text-body-sm font-bold leading-tight text-pine">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={pdfRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
