import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { VerifySignupOtp } from "../services/operations/Auth";
import PhoneOtpForm from "../component/core/Auth/PhoneOtpForm";

// Vendor sign up is the same phone + OTP flow as student sign up - the only
// difference is that once verified, we send the owner to /complete-profile
// with the "canteen" role preselected so they land straight on the canteen
// KYC form instead of picking a role themselves.
const VendorRegisterPage = () => {
  const navigate = useNavigate();

  const handleVerify = (phone, otp, nav) =>
    VerifySignupOtp(phone, otp, nav, "/complete-profile?role=canteen");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Register Your Canteen
            </h2>
            <p className="text-gray-600">
              Verify your phone number to get started. You'll fill in your
              canteen's details right after.
            </p>
          </div>

          <PhoneOtpForm purpose="signup" onVerify={handleVerify} />

          <p className="mt-6 text-sm text-center text-gray-500">
            Already registered?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Sign in here
            </button>
          </p>
          <p className="mt-2 text-sm text-center text-gray-500">
            Signing up as a student instead?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Student sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorRegisterPage;
