import React, { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import OtpInput from "./OtpInput";
import { sendVerificationCode, verifyPhoneCode } from "../requests/verification";

/**
 * Phone verification step.
 *
 * Reached from two places, because the API gates a token behind `is_verify`:
 *   - after registering — 200 with `code: "verification_required"`, no token
 *   - after signing in with an unverified account — 200 with
 *     `items.token === null`
 *
 * Neither verification endpoint returns a token, so once the code is accepted
 * the caller signs in again with the credentials already on screen. That is
 * `onVerified`.
 */

interface Props {
  /** E.164 phone, exactly as registered — the API matches on it verbatim. */
  phone: string;
  lang?: string;
  /** Code accepted; the caller completes sign-in. */
  onVerified: () => void | Promise<void>;
  onBack: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyPhoneStep: React.FC<Props> = ({ phone, lang = "ar", onVerified, onBack }) => {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // A resend is a real request even though nothing is delivered yet, so it is
  // rate-limited here rather than letting the button be hammered.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleVerify = async (submitted?: string) => {
    const value = (submitted ?? code).trim();

    // The API accepts 4–8 digits; the current static code is 4.
    if (value.length < 4) {
      setError("يرجى إدخال رمز التحقق كاملاً");
      return;
    }

    setIsVerifying(true);
    setError("");

    const result = await verifyPhoneCode(phone, value, lang);
    setIsVerifying(false);

    if (!result.ok) {
      // `invalid_code` is the expected failure; anything else still carries a
      // localised message worth showing verbatim.
      setError(result.message || "رمز التحقق غير صحيح");
      setCode("");
      return;
    }

    await onVerified();
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    const result = await sendVerificationCode(phone, lang);
    setIsResending(false);

    if (result.code === "already_verified") {
      // Verified elsewhere in the meantime — nothing left to confirm.
      await onVerified();
      return;
    }

    if (!result.ok) {
      setError(result.message || "تعذّر إرسال الرمز. يرجى المحاولة مجدداً.");
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-app-gold/10 text-app-gold flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-app-text mb-2">تأكيد رقم الهاتف</h2>
        <p className="text-sm text-app-textSec leading-relaxed">
          أدخلي رمز التحقق المرسل إلى
        </p>
        <p className="text-sm font-bold text-app-text mt-1" dir="ltr">{phone}</p>
      </div>

      <div className="mb-4">
        <OtpInput
          value={code}
          onChange={(next) => { setCode(next); if (error) setError(""); }}
          onComplete={(full) => handleVerify(full)}
          disabled={isVerifying}
          invalid={Boolean(error)}
        />
      </div>

      {error && (
        <p className="text-red-500 text-xs font-bold text-center mb-4" role="alert">
          {error}
        </p>
      )}

      <button
        onClick={() => handleVerify()}
        disabled={isVerifying || code.length < 4}
        className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isVerifying ? <Loader2 size={20} className="animate-spin" /> : null}
        <span>{isVerifying ? "جاري التحقق..." : "تأكيد"}</span>
      </button>

      <div className="mt-5 text-center">
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-sm font-bold text-app-gold disabled:text-app-textSec disabled:cursor-not-allowed"
        >
          {isResending
            ? "جاري الإرسال..."
            : cooldown > 0
              ? `إعادة إرسال الرمز خلال ${cooldown} ثانية`
              : "إعادة إرسال الرمز"}
        </button>
      </div>

      <button
        onClick={onBack}
        className="mt-6 w-full flex items-center justify-center gap-2 text-app-textSec text-sm font-medium"
      >
        <ArrowRight size={16} />
        <span>العودة لتسجيل الدخول</span>
      </button>
    </div>
  );
};

export default VerifyPhoneStep;
