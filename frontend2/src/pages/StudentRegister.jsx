import { useState, useEffect } from "react";
import {
  Gift,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
} from "lucide-react";
import GoogleSignUp from "../component/core/Auth/GoogleSignup";
// Mock services and hooks for demonstration
import { useDispatch } from "react-redux";
import { GetAllCampuses, RequestCampus } from "../services/operations/Auth";
import { VerifyOtp } from "../services/operations//Auth";
import { RegisterUser } from "../services/operations/Auth";
import { useNavigate } from "react-router-dom";
import { Roles } from "../constants/constant";

// Mock form validation
const validateForm = (values) => {
  const errors = {};

  if (!values.name || values.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!values.email || !/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.phone || !/^\d{10}$/.test(values.phone)) {
    errors.phone = "Mobile number must be exactly 10 digits";
  }

  if (!values.password || values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords don't match";
  }

  if (!values.campus) {
    errors.campus = "Please select a campus";
  }

  return errors;
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",
    campus: "",
  });
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(true);
  const [campusInput, setCampusInput] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const navigate = useNavigate();
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    mobile: "",
    collegeName: "",
    city: "",
    message: "",
    role: Roles.Student,
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [campusSelected, setCampusSelected] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const filteredCampuses = campusInput
    ? campuses.filter((c) =>
        c.name.toLowerCase().includes(campusInput.toLowerCase())
      )
    : campuses;

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const result = await GetAllCampuses();
        setCampuses(result);
      } catch (error) {
        console.error("Error fetching campuses:", error);
        setIsLoadingCampuses(false);
      }
    };
    fetchCampuses();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate registration API call
      dispatch(RegisterUser(formData));

      setPendingEmail(formData.email);
      setShowOtpDialog(true);
      console.log("Registration successful! Please verify your email.");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCampus = async () => {
    setRequestLoading(true);
    console.log(requestForm);
    try {
      // Simulate API call

      dispatch(RequestCampus(requestForm));
      setShowRequestDialog(false);
      setRequestForm({
        name: "",
        email: "",
        mobile: "",
        collegeName: "",
        city: "",
        message: "",
      });
    } catch (err) {
      console.error("Failed to submit campus request:", err);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const data = {
      email: formData.email,
      otp: otp,
    };

    dispatch(VerifyOtp(data, setShowOtpDialog, navigate));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white flex justify-center relative overflow-hidden transition-all duration-500">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse transition-colors duration-500"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-500"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 dark:bg-white/5 rounded-full blur-2xl animate-pulse delay-2000 transition-colors duration-500"></div> */}

        {/* Floating food icons */}
        {/* <div className="absolute top-20 right-20 w-16 h-16 bg-purple-500/10 dark:bg-purple-500/10 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-2xl">🎂</span>
        </div>
        <div className="absolute top-40 left-32 w-12 h-12 bg-green-500/10 dark:bg-green-500/10 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-xl">🥤</span>
        </div>
        <div className="absolute bottom-32 right-16 w-14 h-14 bg-blue-500/10 dark:bg-blue-500/10 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xl">🍜</span>
        </div>
        <div className="absolute bottom-20 left-20 w-10 h-10 bg-pink-500/10 dark:bg-pink-500/10 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-lg">🍰</span>
        </div> */}
      </div>

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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I am a
                  </label>
                  <div className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold">
                    Student
                  </div>
                </div>

                {/* Campus Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campus
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="text"
                      placeholder="Type your campus name"
                      value={
                        campusSelected &&
                        campuses.find((c) => c._id === formData.campus)
                          ? campuses.find((c) => c._id === formData.campus)
                              .name +
                            (campuses.find((c) => c._id === formData.campus)
                              .city
                              ? ` (${
                                  campuses.find(
                                    (c) => c._id === formData.campus
                                  ).city
                                })`
                              : "")
                          : campusInput
                      }
                      readOnly={campusSelected}
                      onChange={(e) => {
                        setCampusInput(e.target.value);
                        setCampusSelected(false);
                        handleInputChange("campus", "");
                      }}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    {campusSelected && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-xl"
                        onClick={() => {
                          setCampusInput("");
                          setCampusSelected(false);
                          handleInputChange("campus", "");
                        }}
                      >
                        ×
                      </button>
                    )}

                    {/* Autocomplete dropdown */}
                    {!campusSelected &&
                      campusInput &&
                      filteredCampuses.length > 0 && (
                        <div className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                          {filteredCampuses.map((campus) => (
                            <div
                              key={campus._id}
                              className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                              onClick={() => {
                                setCampusInput(
                                  campus.name +
                                    (campus.city ? ` (${campus.city})` : "")
                                );
                                handleInputChange("campus", campus._id);
                                setCampusSelected(true);
                              }}
                            >
                              {campus.name}{" "}
                              {campus.city && (
                                <span className="text-gray-400 text-sm">
                                  ({campus.city})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Request Campus link */}
                    {!campusSelected &&
                      campusInput &&
                      filteredCampuses.length === 0 && (
                        <div className="mt-2">
                          <button
                            type="button"
                            className="text-blue-500 hover:text-blue-600 underline text-sm"
                            onClick={() => setShowRequestDialog(true)}
                          >
                            Can't find your campus?{" "}
                            <span className="font-semibold">
                              Request to add it
                            </span>
                          </button>
                        </div>
                      )}
                  </div>
                  {errors.campus && (
                    <p className="text-red-500 text-sm mt-1">{errors.campus}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange("phone", val);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !campusSelected}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25 group disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>

              {/* Google Sign Up Section */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl px-4 text-gray-600 dark:text-gray-400">
                      Or sign up with
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <GoogleSignUp form={setFormData} />
                </div>
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
              {/* <p className="text-red-600 dark:text-red-300 font-semibold text-lg">
                Get 20% OFF on your first order
              </p> */}
              {/* <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Plus free delivery for your first month
              </p> */}
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
                    Start ordering immediately after signup
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

      {/* Request Campus Modal */}
      {showRequestDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Request New Campus
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={requestForm.name}
                onChange={(e) =>
                  setRequestForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
              />
              <input
                type="email"
                placeholder="Email"
                value={requestForm.email}
                onChange={(e) =>
                  setRequestForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
              />
              <input
                type="tel"
                placeholder="Mobile"
                value={requestForm.mobile}
                onChange={(e) =>
                  setRequestForm((f) => ({ ...f, mobile: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
              />
              <input
                type="text"
                placeholder="College Name"
                value={requestForm.collegeName}
                onChange={(e) =>
                  setRequestForm((f) => ({ ...f, collegeName: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
              />
              <input
                type="text"
                placeholder="City"
                value={requestForm.city}
                onChange={(e) =>
                  setRequestForm((f) => ({ ...f, city: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
              />
              <input
                type="text"
                placeholder="Message (optional)"
                value={requestForm.message}
                onChange={(e) =>
                  setRequestForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRequestDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestCampus}
                disabled={requestLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                {requestLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showOtpDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Email Verification
            </h3>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-200">
                Enter the OTP sent to{" "}
                <span className="font-semibold">{pendingEmail}</span>
              </p>
              <p className="text-sm text-gray-500">
                For demo, use OTP:{" "}
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  123456
                </span>
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-center text-lg tracking-widest font-mono"
              />
              {otpError && (
                <div className="text-red-500 text-sm">{otpError}</div>
              )}
              {otpSuccess && (
                <div className="text-green-600 text-sm">{otpSuccess}</div>
              )}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || !otp}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
