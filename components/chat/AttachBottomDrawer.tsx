"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  CLAIM_STATUS_TABS,
  type ClaimStatusFilter,
} from "@/features/claims-history/constants";
import type { UploadOptionId } from "@/features/chat/types";

type DrawerTab = "upload" | "history";

type AttachBottomDrawerProps = {
  open: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
};

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 5.2A1.7 1.7 0 0 1 4.2 3.5h1.1l.7-1.1h4l.7 1.1h1.1A1.7 1.7 0 0 1 13.5 5.2v6.1a1.7 1.7 0 0 1-1.7 1.7H4.2a1.7 1.7 0 0 1-1.7-1.7V5.2Z"
        stroke="#003434"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8.2" r="2.1" stroke="#003434" strokeWidth="1.5" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 2.5h5.2L12.5 6v7.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"
        stroke="#003434"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9.2 2.5V6H12.5" stroke="#003434" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="2.5"
        width="12"
        height="11"
        rx="1.5"
        stroke="#003434"
        strokeWidth="1.5"
      />
      <circle cx="5.5" cy="6" r="1.2" stroke="#003434" strokeWidth="1.3" />
      <path
        d="M2.5 11.5 5.8 8.5l2.4 2.2 1.8-1.5L13.5 12"
        stroke="#003434"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const UPLOAD_OPTIONS: {
  id: UploadOptionId;
  label: ReactNode;
  accept: string;
  capture?: boolean;
  icon: ReactNode;
}[] = [
  {
    id: "camera",
    label: (
      <>
        Take
        <br />
        photo
      </>
    ),
    accept: "image/*",
    capture: true,
    icon: <CameraIcon />,
  },
  {
    id: "pdf",
    label: (
      <>
        Upload
        <br />
        PDF
      </>
    ),
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

export function AttachBottomDrawer({
  open,
  onClose,
  onFileSelected,
  onSend,
  disabled,
}: AttachBottomDrawerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<DrawerTab>("upload");
  const [activeFilter, setActiveFilter] = useState<ClaimStatusFilter>("all");
  const [message, setMessage] = useState("");
  const cameraRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handleDrawerClose() {
    setTab("upload");
    setMessage("");
    onClose();
  }

  function openClaimHistory(filter: ClaimStatusFilter) {
    setActiveFilter(filter);
    handleDrawerClose();
    const href =
      filter === "all"
        ? "/claims-history"
        : `/claims-history?status=${filter}`;
    router.push(href);
  }

  const refs = {
    camera: cameraRef,
    pdf: pdfRef,
    gallery: galleryRef,
  } as const;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setTab("upload");
      setMessage("");
      onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function handlePick(optionId: UploadOptionId) {
    if (disabled) return;
    refs[optionId].current?.click();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onFileSelected(file);
    handleDrawerClose();
  }

  function handleSend() {
    const next = message.trim();
    if (!next || disabled) return;
    onSend(next);
    handleDrawerClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 mx-auto max-w-[402px] ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close attach drawer"
        onClick={handleDrawerClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload bill and claim history"
        className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 rounded-t-3xl bg-white px-4 pb-8 pt-3 shadow-[0_-8px_32px_rgba(0,42,25,0.12)] transition-transform duration-200 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pb-1">
          <div className="h-1 w-11 rounded-sm bg-[#E2E8F0]" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex overflow-hidden rounded-[20px] border border-[#DCE7E3]">
              <button
                type="button"
                onClick={() => setTab("upload")}
                className={`flex flex-1 items-center justify-center px-4 py-2.5 font-sans text-sm font-bold ${
                  tab === "upload"
                    ? "bg-pine-primary text-white"
                    : "bg-white text-[#003434]"
                }`}
              >
                Upload bill
              </button>
              <button
                type="button"
                onClick={() => setTab("history")}
                className={`flex flex-1 items-center justify-center border-l border-[#DCE7E3] px-4 py-2.5 font-sans text-sm font-bold ${
                  tab === "history"
                    ? "bg-pine-primary text-white"
                    : "bg-white text-[#003434]"
                }`}
              >
                Claim history
              </button>
            </div>

            {tab === "upload" ? (
              <div className="flex gap-2">
                {UPLOAD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePick(option.id)}
                    className="flex h-[102px] flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-[#EBECEB] bg-white p-3 text-center disabled:opacity-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF5F1]">
                      {option.icon}
                    </span>
                    <span className="w-full font-sans text-xs font-bold leading-tight text-[#003434]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[102px] flex-wrap content-start gap-2">
                {CLAIM_STATUS_TABS.map((filter) => {
                  const active = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => openClaimHistory(filter.id)}
                      className={`rounded-[20px] border px-4 py-2.5 font-sans text-sm font-bold ${
                        active
                          ? "border-pine-primary bg-pine-primary text-white"
                          : "border-[#DCE7E3] bg-white text-[#003434]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-[32px] border border-[#E5ECE8] bg-white p-1.5">
            <button
              type="button"
              aria-label="Close attach options"
              onClick={handleDrawerClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF5F2]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 3.75v10.5M3.75 9h10.5"
                  stroke="#003434"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Claims Assistant..."
              disabled={disabled}
              className="min-w-0 flex-1 bg-transparent font-sans text-sm text-pine outline-none placeholder:text-[#829490] disabled:opacity-60"
            />

            <button
              type="button"
              aria-label="Send message"
              disabled={disabled || !message.trim()}
              onClick={handleSend}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#E9EFEA] disabled:opacity-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3.5 9.2 14.5 3.5l-3.2 11.2-2.4-4.3L3.5 9.2z"
                  stroke="#003434"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
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
    </div>
  );
}
