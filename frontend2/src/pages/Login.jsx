import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../component/ui/button";
import { Users, GraduationCap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../component/ui/tooltip";
import { VerifyLoginOtp } from "../services/operations/Auth";
import PhoneOtpForm from "../component/core/Auth/PhoneOtpForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-background dark:bg-[#05080f] flex justify-center relative overflow-hidden transition-all duration-500">
      {/* Background: fully animated and custom colored */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Food Icons (with your custom float/bounce keyframes) */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center animate-float">
          <span className="text-2xl">🍕</span>
        </div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center animate-float-delayed">
          <span className="text-xl">🍔</span>
        </div>
        <div className="absolute bottom-32 left-16 w-14 h-14 bg-yellow-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
          <span className="text-xl">🌮</span>
        </div>
      </div>

      <div className="flex w-full max-w-7xl mx-auto relative z-16 mt-20">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <div className="text-center animate-slide-in-left">
            <div className="mb-12">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-spin-slow opacity-20"></div>
                  <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <span className="text-5xl font-black text-white relative select-none">
                      {/* Gradient + Pulse */}
                      <span
                        className="absolute inset-0 text-5xl font-black bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent animate-pulse"
                        style={{ filter: "blur(1px)" }}
                      >
                        CB
                      </span>
                      <span
                        className="relative text-white"
                        style={{
                          textShadow:
                            "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.5), 0 0 40px rgba(255,204,0,0.8), 0 0 70px rgba(255,204,0,0.6), 0 0 80px rgba(255,204,0,0.4), 0 0 100px rgba(255,204,0,0.3)",
                        }}
                      >
                        CB
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-3 transition-all duration-500">
                Campus Bites
              </h1>
              <p className="text-gray-400 text-lg dark:text-[#8892b0]">
                Your premium campus food experience
              </p>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Students</h3>
                  <p className="text-gray-400 dark:text-[#8892b0]">
                    Order your favorite meals instantly
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-500">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Campus Partners
                  </h3>
                  <p className="text-gray-400 dark:text-[#8892b0]">
                    Manage your restaurant & orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-card dark:bg-[#0b1120] backdrop-blur-xl border border-border dark:border-[#4f5d75] rounded-3xl p-10 shadow-2xl animate-slide-in-right relative overflow-hidden transition-all duration-500">
              {/* Animated Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-foreground mb-3 transition-all duration-500 dark:text-[#e2e8f0]">
                    Welcome Back!
                  </h2>
                  <p className="text-muted-foreground text-lg dark:text-[#8892b0] transition-all duration-500">
                    New to Campus Bites?{" "}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to="/register"
                            aria-label="register here"
                            className="text-red-400 hover:text-red-300 font-semibold hover:underline transition-all duration-500"
                          >
                            Join us here
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>Sign up</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </p>
                </div>
                <PhoneOtpForm purpose="login" onVerify={VerifyLoginOtp} />

                {/* Campus Registration CTA */}
                <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-500/20 dark:border-green-900/40 rounded-2xl transition-all duration-500">
                  <div className="text-center">
                    <h3 className="text-foreground font-semibold mb-2 transition-all duration-500 dark:text-[#e2e8f0]">
                      Want to partner with us?
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 dark:text-[#8892b0]">
                      Join as a campus Vendor partner
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      aria-label="register your vendor"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all duration-500 bg-transparent"
                    >
                      <Link
                        to="/vendor-register"
                        aria-label="Register Your Vendor"
                      >
                        Register Your Vendor
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
