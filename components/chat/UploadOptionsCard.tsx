"use client";

import { useRef, type ChangeEvent, type ReactNode } from "react";
import type { UploadOptionId } from "@/features/chat/types";

type UploadOptionsCardProps = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
};

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M5 2.5h5.5L14 6v9.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z"
        stroke="#005656"
        strokeWidth="1.4"
      />
      <path d="M10.5 2.5V6H14" stroke="#005656" strokeWidth="1.4" />
      <path
        d="M6.5 9.5h5M6.5 12h3.5"
        stroke="#005656"
        strokeWidth="1.4"
        strokeLinecap="round"
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
        stroke="#0F3F37"
        strokeWidth="1.6"
      />
      <circle cx="14" cy="14.5" r="4" stroke="#0F3F37" strokeWidth="1.6" />
      <path
        d="M10 7l1.2-2h5.6L18 7"
        stroke="#0F3F37"
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
        stroke="#0F3F37"
        strokeWidth="1.6"
      />
      <path d="M16 4v5h5" stroke="#0F3F37" strokeWidth="1.6" />
      <path
        d="M10 14h8M10 17.5h5"
        stroke="#0F3F37"
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
        stroke="#0F3F37"
        strokeWidth="1.6"
      />
      <circle cx="10" cy="12" r="2" stroke="#0F3F37" strokeWidth="1.4" />
      <path
        d="M4.5 18.5l5.5-5 4 3.5 3-2.5 6.5 4.5"
        stroke="#0F3F37"
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
    <div className="w-full max-w-[340px] rounded-2xl border border-input-border bg-white p-4 shadow-[2px_2px_10px_rgba(0,42,25,0.05)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F6EF]">
          <DocumentIcon />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-pine">
            {title}
          </h3>
          <p className="mt-0.5 font-sans text-xs text-subtle">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => handlePick(option.id)}
            className="flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-xl border border-input-border bg-[#F8FBFA] px-2 py-3 text-center disabled:opacity-50"
          >
            {option.icon}
            <span className="font-sans text-[11px] font-semibold leading-tight text-pine">
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
