import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { VerifySignupOtp } from "../services/operations/Auth";
import PhoneOtpForm from "../component/core/Auth/PhoneOtpForm";

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white flex justify-center relative overflow-hidden transition-all duration-500">
      <div className="flex w-full max-w-6xl mx-auto relative z-16 mt-20">
        {/* Left Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Join Campus Bites!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              <div className="[&_label]:text-gray-700 [&_label]:dark:text-gray-300 [&_input]:bg-gray-50 [&_input]:dark:bg-gray-700 [&_input]:border-gray-300 [&_input]:dark:border-gray-600 [&_input]:text-gray-900 [&_input]:dark:text-white">
                <PhoneOtpForm purpose="signup" onVerify={VerifySignupOtp} />
              </div>

              <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                By creating an account, you agree to our{" "}
                <button
                  onClick={() => navigate("/terms")}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  onClick={() => navigate("/privacy")}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 underline"
                >
                  Privacy Policy
                </button>
                .
              </p>

              <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                Registering a canteen instead?{" "}
                <button
                  onClick={() => navigate("/vendor-register")}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium underline"
                >
                  Register your vendor
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits Panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <div className="text-center">
            <div className="mb-8 p-6 bg-gradient-to-r from-red-500/5 dark:from-red-500/10 to-rose-500/5 dark:to-rose-500/10 border border-red-500/10 dark:border-red-500/20 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Bonus!
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">
                    Instant Access
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Verify your phone and start ordering right away
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">💎</span>
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">
                    Premium Features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Order tracking, favorites, and more
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">
                    Loyalty Rewards
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Earn points with every order
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
