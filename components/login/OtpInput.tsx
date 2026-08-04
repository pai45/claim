"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { OTP_LENGTH } from "@/features/auth/otp";

export type OtpInputHandle = {
  focus: (index?: number) => void;
};

type OtpInputProps = {
  digits: string[];
  invalid: boolean;
  disabled: boolean;
  labelId: string;
  describedById: string;
  onDigitChange: (index: number, value: string) => void;
  onFill: (index: number, text: string) => void;
  onSubmit: () => void;
};

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  function OtpInput(
    {
      digits,
      invalid,
      disabled,
      labelId,
      describedById,
      onDigitChange,
      onFill,
      onSubmit,
    },
    ref,
  ) {
    const boxes = useRef<Array<HTMLInputElement | null>>([]);

    useImperativeHandle(ref, () => ({
      focus: (index = 0) => boxes.current[index]?.focus(),
    }));

    function focusBox(index: number) {
      const clamped = Math.min(Math.max(index, 0), OTP_LENGTH - 1);
      boxes.current[clamped]?.focus();
    }

    function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
      const { value } = event.target;

      // iOS autofill drops the whole SMS code into the first box, so a
      // multi-character value takes the same path as a paste.
      if (value.length > 1) {
        onFill(index, value);
        focusBox(index + value.replace(/\D/g, "").length);
        return;
      }

      onDigitChange(index, value);
      if (value) focusBox(index + 1);
    }

    function handleKeyDown(
      index: number,
      event: KeyboardEvent<HTMLInputElement>,
    ) {
      if (event.key === "Backspace" && !digits[index]) {
        // Only step back off an already-empty box; on a filled one, clearing
        // in place is what users expect.
        event.preventDefault();
        if (index === 0) return;
        onDigitChange(index - 1, "");
        focusBox(index - 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusBox(index - 1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusBox(index + 1);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onSubmit();
      }
    }

    function handlePaste(
      index: number,
      event: ClipboardEvent<HTMLInputElement>,
    ) {
      event.preventDefault();
      const text = event.clipboardData.getData("text");
      onFill(index, text);
      focusBox(index + text.replace(/\D/g, "").length);
    }

    return (
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={describedById}
        className="flex gap-2"
      >
        {digits.map((digit, index) => (
          <input
            // Fixed-length positional boxes: the index is the identity.
            key={index}
            ref={(node) => {
              boxes.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            // No `maxLength={1}`: it would clip an autofilled six-digit code to
            // one character before onChange runs, so the code would never
            // spread across the boxes. The reducer keeps only the last digit,
            // and `onFocus` selects, so a box still holds exactly one.
            // Only the first box: iOS delivers the whole code to one field.
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            value={digit}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={(event) => event.target.select()}
            className={`h-14 min-w-0 flex-1 rounded-control border bg-input-soft text-center text-title font-bold text-pine outline-none transition-colors focus:border-pine disabled:opacity-60 ${
              invalid
                ? "border-danger"
                : digit
                  ? "border-pine-primary"
                  : "border-input-border"
            }`}
          />
        ))}
      </div>
    );
  },
);
