import { useEffect, useRef, useState } from "react";

export default function EmailVerificationCard({
  email = "",
  onResend,
  onVerify,
  title = "Awaiting Email Verification",
  description,
  buttonLabel = "VERIFY OTP",
  submittingLabel = "VERIFYING...",
}) {

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const [disabled, setDisabled] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputsRef = useRef([]);

  // ⏱ Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // 🔢 Handle OTP input
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move forward
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // ⬅️ Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // 🔁 Resend OTP
  const handleResend = async () => {
    if (isResending || typeof onResend !== "function") return;

    setIsResending(true);
    const sent = await onResend();
    if (sent) {
      setTimeLeft(60);
      setDisabled(true);
    }
    setIsResending(false);
  };

  // ✅ Verify OTP
  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6 || typeof onVerify !== "function" || isSubmitting) return;

    setIsSubmitting(true);
    await onVerify(finalOtp);
    setIsSubmitting(false);
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-primary/10 p-8 rounded-2xl shadow-xl border-4 border-primary/10 text-center space-y-6">

      {/* Icon */}
      <div className="flex justify-center">
        <div className="bg-primary/10 text-primary p-4 rounded-full">
          <span className="material-symbols-outlined text-4xl">
            mark_email_unread
          </span>
        </div>
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {description ?? (
            <>
              We've sent a One-Time Password (OTP) to your email.
              Please enter it below to verify your account{email ? ` (${email})` : ""}.
            </>
          )}
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            maxLength={1}
            className="w-12 h-12 text-center rounded-lg border-2 border-primary/20 focus:border-primary focus:ring-0 font-bold text-lg bg-white dark:bg-slate-800"
            type="text"
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!isOtpComplete || isSubmitting}
        className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg hover:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? submittingLabel : buttonLabel}
      </button>

      {/* Resend */}
      <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
        Didn’t receive the code?
        <button
          onClick={handleResend}
          disabled={disabled || isResending}
          className="text-primary ml-1 disabled:text-slate-400"
        >
          {isResending ? "Sending..." : disabled ? `Resend OTP (${timeLeft}s)` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}