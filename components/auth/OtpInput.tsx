import React, { useMemo, useRef } from "react";

/**
 * Segmented one-time-code input.
 *
 * Modelled on the shadcn `input-otp` interaction (separate slots, auto-advance,
 * paste-to-fill, arrow-key navigation) but written against this project's own
 * tokens. shadcn was not used because none of its infrastructure exists here:
 * Tailwind is the CDN build configured inline in `index.html`, so there is no
 * PostCSS pipeline and none of the CSS variables its components theme against,
 * and it would have pulled in `input-otp`, `clsx`, `tailwind-merge` and `cva`.
 *
 * The field stays LTR while the page is RTL — a numeric code reads left to
 * right in both languages, and letting it inherit `dir="rtl"` puts the first
 * digit on the right, which is where the caret jumps unexpectedly.
 */

interface Props {
  value: string;
  onChange: (next: string) => void;
  /** The backend accepts 4–8; the current static code is 4. */
  length?: number;
  disabled?: boolean;
  /** Fired when the last slot is filled — used to submit without a second tap. */
  onComplete?: (code: string) => void;
  /** Renders the slots in the error colour. */
  invalid?: boolean;
}

const OtpInput: React.FC<Props> = ({
  value,
  onChange,
  length = 4,
  disabled = false,
  onComplete,
  invalid = false,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const digits = useMemo(() => {
    const chars = value.replace(/\D/g, "").slice(0, length).split("");
    return Array.from({ length }, (_, i) => chars[i] ?? "");
  }, [value, length]);

  const focusSlot = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const commit = (next: string) => {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
    if (cleaned.length === length) onComplete?.(cleaned);
  };

  const handleChange = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;

    // Typing into a slot replaces just that slot; pasting several digits at
    // once fills forward from it.
    const chars = digits.slice();
    typed.split("").forEach((char, offset) => {
      if (index + offset < length) chars[index + offset] = char;
    });

    commit(chars.join(""));
    focusSlot(index + typed.length);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = digits.slice();

      if (chars[index]) {
        // Clear this slot and stay put.
        chars[index] = "";
        commit(chars.join(""));
        return;
      }
      // Already empty — step back and clear that one instead.
      if (index > 0) {
        chars[index - 1] = "";
        commit(chars.join(""));
        focusSlot(index - 1);
      }
      return;
    }

    // Arrows are visual, so they follow the LTR field rather than the RTL page.
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusSlot(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusSlot(index + 1);
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    // Handled here so pasting a full code from an SMS fills every slot rather
    // than dropping the whole string into one.
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();

    const chars = digits.slice();
    pasted.split("").forEach((char, offset) => {
      if (index + offset < length) chars[index + offset] = char;
    });
    commit(chars.join(""));
    focusSlot(index + pasted.length);
  };

  return (
    <div
      dir="ltr"
      role="group"
      aria-label="رمز التحقق"
      className="flex items-center justify-center gap-3"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          // `inputMode` brings up the numeric keypad; `type=text` keeps the
          // value controllable (number inputs drop leading zeros and allow
          // `e`, `+`, `-`).
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`الرقم ${index + 1} من ${length}`}
          className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 bg-white outline-none transition-colors tabular-nums
            ${invalid
              ? "border-red-400 text-red-600 focus:border-red-500"
              : "border-app-card text-app-text focus:border-app-gold"}
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
