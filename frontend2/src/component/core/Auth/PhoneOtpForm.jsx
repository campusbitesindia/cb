import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Phone, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../ui/input-otp";
import toast from "react-hot-toast";
import { SendPhoneOtp } from "../../../services/operations/Auth";

const RESEND_COOLDOWN = 45;

/**
 * Two-step phone number + OTP entry.
 *
 * purpose: "signup" | "login"
 * onVerify: the redux thunk to dispatch for verification, receiving
 *           (phone, otp, navigate) - e.g. VerifySignupOtp or VerifyLoginOtp
 */
export default function PhoneOtpForm({ purpose, onVerify }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10 digit phone number");
      return;
    }
    setSending(true);
    const result = await dispatch(SendPhoneOtp(phone, purpose));
    setSending(false);
    if (result.success) {
      setStep("otp");
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
    } else if (result.retryAfter > 0) {
      // Server is still enforcing a cooldown from an earlier request (e.g.
      // after a page refresh). Sync the local timer instead of letting the
      // person keep hitting a disabled-looking button.
      setCooldown(result.retryAfter);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    sendOtp();
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    sendOtp();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6 digit OTP");
      return;
    }
    setVerifying(true);
    await dispatch(onVerify(phone, otp, navigate));
    setVerifying(false);
  };

  if (step === "phone") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-6">
        <div>
          <label className="text-foreground text-lg font-semibold transition-all duration-500 dark:text-[#e2e8f0] block mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-6 h-6 transition-all duration-500 drop-shadow" />
            <Input
              placeholder="Enter your 10 digit phone number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              aria-label="enter your phone number here"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="pl-12 bg-input dark:bg-[#232838] border-border dark:border-[#38405a] text-foreground dark:text-[#e2e8f0] placeholder-muted-foreground dark:placeholder-[#8892b0] rounded-xl h-14 text-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-500"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={sending || cooldown > 0}
          className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:scale-105 text-white font-bold py-4 rounded-xl transition-all duration-500 shadow-lg text-lg group h-14"
        >
          <div className="flex items-center gap-3">
            {sending
              ? "Sending OTP..."
              : cooldown > 0
              ? `Try again in ${cooldown}s`
              : "Send OTP"}
            {!sending && cooldown === 0 && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all duration-500" />
            )}
          </div>
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div>
        <label className="text-foreground text-lg font-semibold transition-all duration-500 dark:text-[#e2e8f0] block mb-2">
          Enter OTP
        </label>
        <p className="text-muted-foreground dark:text-[#8892b0] text-sm mb-4">
          We sent a 6 digit code to +91 {phone}.{" "}
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
            }}
            className="text-red-400 hover:text-red-300 hover:underline font-medium"
          >
            Change number
          </button>
        </p>
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 text-xl bg-input dark:bg-[#232838] border-border dark:border-[#38405a] text-foreground dark:text-[#e2e8f0] rounded-xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
      <Button
        type="submit"
        disabled={verifying}
        className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:scale-105 text-white font-bold py-4 rounded-xl transition-all duration-500 shadow-lg text-lg group h-14"
      >
        <div className="flex items-center gap-3">
          {verifying ? "Verifying..." : "Verify OTP"}
          {!verifying && <ShieldCheck className="w-5 h-5" />}
        </div>
      </Button>
      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground dark:text-[#8892b0] hover:text-red-400 disabled:opacity-50 disabled:hover:text-muted-foreground transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
      </button>
    </form>
  );
}
