"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { BackNavigationButton } from "@/components/shared/BackNavigationButton";
import { useActivePersona } from "@/features/persona/useActivePersona";
import { colors } from "@/lib/ui/colors";
import { staggerStyle } from "@/lib/ui/staggerStyle";

type ProfileDetailsScreenProps = {
  onBack: () => void;
};

export function ProfileDetailsScreen({ onBack }: ProfileDetailsScreenProps) {
  const { persona } = useActivePersona();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(persona.profile.name);
  const [dateOfBirth, setDateOfBirth] = useState(
    persona.profile.dateOfBirthFormatted || "15 March 1995"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleSave() {
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  }

  function handleCancel() {
    setFullName(persona.profile.name);
    setDateOfBirth(persona.profile.dateOfBirthFormatted || "15 March 1995");
    setIsEditing(false);
  }

  return (
    <AppShell className="overflow-hidden bg-white">
      {/* Header with Back button and centered title */}
      <header className="relative flex w-full shrink-0 items-center justify-between px-page pb-3 pt-2">
        <BackNavigationButton onClick={onBack} ariaLabel="Back to Profile" />
        <h1 className="type-screen-title absolute left-0 right-0 text-center pointer-events-none">
          Profile
        </h1>
        <div className="w-11" aria-hidden="true" />
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8 pt-4">
        {/* User Avatar & Hero Section */}
        <section
          className="animate-rise-in flex flex-col items-center pb-6"
          style={staggerStyle(0)}
        >
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full shadow-soft"
            style={{
              background: `linear-gradient(180deg, ${colors.pinePrimary} 0%, ${colors.pine} 100%)`,
            }}
            aria-hidden="true"
          >
            <UserAvatarIcon />
          </div>

          <h2 className="type-section-title mt-4 text-center text-xl font-bold text-ink">
            {fullName || persona.profile.name}
          </h2>
          <p className="type-body-secondary mt-1 text-center text-xs text-subtle">
            {persona.profile.memberSince}
          </p>
        </section>

        {/* Success Feedback Alert */}
        {savedSuccess ? (
          <div
            role="status"
            className="animate-rise-in mb-4 flex items-center justify-center gap-2 rounded-control bg-success-soft px-3 py-2 text-center text-caption font-bold text-success border border-success-border"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            Profile updated successfully
          </div>
        ) : null}

        {/* Edit Button */}
        <div
          className="animate-rise-in flex justify-end pb-2"
          style={staggerStyle(1)}
        >
          {isEditing ? (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex min-h-11 items-center gap-1.5 px-2 text-caption font-bold text-ink-secondary hover:text-ink transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex min-h-11 items-center gap-1.5 px-2 text-caption font-bold text-pine-primary hover:opacity-80 transition-opacity"
              aria-label="Edit Profile"
            >
              <PencilEditIcon />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Form Fields matching Mobile Number Input Screen styling */}
        <div className="flex flex-col gap-5" style={staggerStyle(2)}>
          {/* Full Name Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="profile-full-name" className="type-field-label">
              Full Name
            </label>
            <div
              className={`field-focus-shell flex min-h-14 items-center gap-3 rounded-control border border-input-border px-3.5 transition-colors ${
                isEditing ? "bg-white shadow-soft" : "bg-input-soft"
              }`}
            >
              <span className="shrink-0" aria-hidden="true">
                <UserOutlineIcon />
              </span>
              <input
                id="profile-full-name"
                type="text"
                value={fullName}
                readOnly={!isEditing}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className={`w-full bg-transparent text-body font-bold tracking-wide text-pine outline-none placeholder:font-normal placeholder:text-muted ${
                  !isEditing ? "cursor-default" : ""
                }`}
              />
            </div>
          </div>

          {/* Mobile Number Field (Non-editable) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-mobile-number" className="type-field-label">
              Mobile Number
            </label>
            <div className="field-focus-shell flex min-h-14 items-center gap-3 rounded-control border border-input-border bg-input-soft px-3.5">
              <span className="shrink-0" aria-hidden="true">
                <PhoneOutlineIcon />
              </span>
              <input
                id="profile-mobile-number"
                type="tel"
                value={persona.profile.phone || "+91 7761813691"}
                readOnly
                aria-describedby="mobile-non-editable-hint"
                className="w-full cursor-default bg-transparent text-body font-bold tracking-wide text-ink-secondary outline-none"
              />
            </div>
            <p
              id="mobile-non-editable-hint"
              className="text-right text-caption text-subtle font-medium"
            >
              Non-editable
            </p>
          </div>

          {/* Date of Birth Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="profile-dob" className="type-field-label">
              Date of Birth
            </label>
            <div
              className={`field-focus-shell flex min-h-14 items-center gap-3 rounded-control border border-input-border px-3.5 transition-colors ${
                isEditing ? "bg-white shadow-soft" : "bg-input-soft"
              }`}
            >
              <span className="shrink-0" aria-hidden="true">
                <CalendarOutlineIcon />
              </span>
              <input
                id="profile-dob"
                type="text"
                value={dateOfBirth}
                readOnly={!isEditing}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="DD Month YYYY"
                className={`w-full bg-transparent text-body font-bold tracking-wide text-pine outline-none placeholder:font-normal placeholder:text-muted ${
                  !isEditing ? "cursor-default" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Save Changes CTA when in edit mode */}
        {isEditing ? (
          <div className="animate-rise-in mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary w-full"
            >
              Save Changes
            </button>
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}

function UserAvatarIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4.5" fill="white" />
      <path
        d="M4.5 19.5c0-3.8 3.3-6.5 7.5-6.5s7.5 2.7 7.5 6.5"
        fill="white"
      />
    </svg>
  );
}

function PencilEditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a4.34 4.34 0 0 0-1.127 1.947l-.547 2.373a.5.5 0 0 0 .6.6l2.373-.547a4.34 4.34 0 0 0 1.947-1.127l5.727-5.727a2.25 2.25 0 0 0-3.182-3.182z"
        stroke={colors.pinePrimary}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
        stroke={colors.pinePrimary}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserOutlineIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke={colors.inkSecondary}
        strokeWidth="1.8"
      />
      <path
        d="M5 19.5c1.8-3.8 4.8-5.5 7-5.5s5.2 1.7 7 5.5"
        stroke={colors.inkSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneOutlineIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"
        stroke={colors.inkSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarOutlineIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2.5"
        stroke={colors.inkSecondary}
        strokeWidth="1.8"
      />
      <path
        d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
        stroke={colors.inkSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
