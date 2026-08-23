import React, { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import OtpInput from "./OtpInput";
import PhoneField from "../PhoneField";
import { forgotPassword, resetPassword } from "../requests/passwordReset";
import { hasEnoughDigits, MIN_NATIONAL_DIGITS } from "../../lib/phone";

/**
 * Password reset. Reached from the "نسيت كلمة المرور؟" link on the login form.
 *
 * Two steps, not three: the backend's own `verify-code` endpoint is optional
 * and its docs recommend collecting the code and the new password on one
 * screen, so `reset` is called directly rather than adding a screen just to
 * confirm the code first.
 */

interface Props {
  /** Prefilled from whatever the user already typed on the login form. */
  initialPhone?: string;
  initialDialCode?: string;
  lang?: string;
  /** Password changed; caller returns to login. */
  onDone: () => void;
  onBack: () => void;
}

type Step = "phone" | "reset";

const RESEND_COOLDOWN_SECONDS = 60;

const ForgotPasswordFlow: React.FC<Props> = ({
  initialPhone = "",
  initialDialCode = "",
  lang = "ar",
  onDone,
  onBack,
}) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(initialPhone);
  const [dialCode, setDialCode] = useState(initialDialCode);
  /** Exact spelling the backend accepted — `reset` must reuse it verbatim. */
  const [resolvedPhone, setResolvedPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasEnoughDigits(phone, dialCode.length)) {
      setError(`رقم الهاتف يجب أن يكون ${MIN_NATIONAL_DIGITS} أرقام على الأقل`);
      return;
    }

    setIsRequesting(true);
    const result = await forgotPassword(phone, dialCode, lang);
    setIsRequesting(false);

    if (!result.ok) {
      setError(result.message || "تعذّر إرسال رمز الاستعادة.");
      return;
    }

    setResolvedPhone(result.resolvedPhone ?? phone);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setStep("reset");
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    const result = await forgotPassword(phone, dialCode, lang);
    setIsResending(false);

    if (!result.ok) {
      // Only a real 429 re-arms the lockout, using however long the backend
      // says is left. Any other failure (network blip, etc.) leaves cooldown
      // at 0 so the customer can retry immediately instead of being punished
      // with a 60s wait for an error that had nothing to do with pacing.
      if (result.code === "resend_cooldown") {
        const retryAfter = Number(result.items?.retry_after_seconds);
        setCooldown(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : RESEND_COOLDOWN_SECONDS);
      }
      setError(result.message || "تعذّر إرسال الرمز. يرجى المحاولة مجدداً.");
      return;
    }

    setResolvedPhone(result.resolvedPhone ?? resolvedPhone);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length < 4) {
      setError("يرجى إدخال رمز التحقق كاملاً");
      return;
    }
    if (password.length < 6 || password.length > 20) {
      setError("كلمة المرور يجب أن تكون بين 6 و20 حرفاً");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    setIsResetting(true);
    const result = await resetPassword(resolvedPhone, code, password, confirmPassword, lang);
    setIsResetting(false);

    if (!result.ok) {
      // Undifferentiated on purpose, matching VerifyPhoneStep: a wrong,
      // expired or spent code all just clear the field and show the message.
      setError(result.message || "تعذّر تغيير كلمة المرور.");
      setCode("");
      return;
    }

    toast(result.message || "تم تغيير كلمة المرور بنجاح", {
      style: {
        background: "#1B8354",
        color: "#fff",
        borderRadius: "10px",
        boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
      },
    });
    onDone();
  };

  if (step === "phone") {
    return (
      <div className="animate-fadeIn">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-app-gold/10 text-app-gold flex items-center justify-center mb-4">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-bold text-app-text mb-2">استعادة كلمة المرور</h2>
          <p className="text-sm text-app-textSec leading-relaxed">
            أدخلي رقم هاتفك المسجّل وسنرسل رمز الاستعادة عبر واتساب
          </p>
        </div>

        <form onSubmit={handleRequestCode} className="space-y-4">
          <PhoneField
            value={phone}
            onChange={(value, code) => {
              setPhone(value);
              setDialCode(code);
            }}
            disabled={isRequesting}
            hasError={Boolean(error)}
          />

          {error && (
            <p className="text-red-500 text-xs font-bold text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isRequesting}
            className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRequesting ? <Loader2 size={20} className="animate-spin" /> : null}
            <span>{isRequesting ? "جاري الإرسال..." : "إرسال رمز الاستعادة"}</span>
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-6 w-full flex items-center justify-center gap-2 text-app-textSec text-sm font-medium"
        >
          <ArrowRight size={16} />
          <span>العودة لتسجيل الدخول</span>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-app-gold/10 text-app-gold flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-app-text mb-2">تعيين كلمة مرور جديدة</h2>
        <p className="text-sm text-app-textSec leading-relaxed">أدخلي رمز التحقق المرسل إلى</p>
        <p className="text-sm font-bold text-app-text mt-1" dir="ltr">{resolvedPhone}</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next);
            if (error) setError("");
          }}
          disabled={isResetting}
          invalid={Boolean(error)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="كلمة المرور الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-app-bg border border-app-card rounded-2xl outline-none focus:border-app-gold text-right pr-12 pl-12 text-app-text font-medium"
            dir="ltr"
            disabled={isResetting}
          />
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec hover:text-app-gold transition-colors"
            disabled={isResetting}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 bg-app-bg border border-app-card rounded-2xl outline-none focus:border-app-gold text-right pr-12 pl-12 text-app-text font-medium"
            dir="ltr"
            disabled={isResetting}
          />
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-app-textSec" size={20} />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-app-textSec hover:text-app-gold transition-colors"
            disabled={isResetting}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-xs font-bold text-center" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isResetting || code.length < 4}
          className="w-full bg-app-gold text-white font-bold py-4 rounded-2xl shadow-lg shadow-app-gold/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isResetting ? <Loader2 size={20} className="animate-spin" /> : null}
          <span>{isResetting ? "جاري التغيير..." : "تغيير كلمة المرور"}</span>
        </button>
      </form>

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

export default ForgotPasswordFlow;
