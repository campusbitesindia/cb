import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, MapPin, Store, Clock, FileText, Upload } from "lucide-react";
import { Roles } from "../constants/constant";
import {
  CompleteProfile as CompleteProfileThunk,
  CreateCanteenProfile,
  GetAllCampuses,
  RequestCampus,
} from "../services/operations/Auth";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

export default function CompleteProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, User: currentUser } = useSelector((state) => state.Auth);

  const [step, setStep] = useState("basic"); // "basic" | "canteen"
  const [submitting, setSubmitting] = useState(false);

  // ---- Step 1: name / role / campus ----
  const [name, setName] = useState("");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [campuses, setCampuses] = useState([]);
  const [campusInput, setCampusInput] = useState("");
  const [campusId, setCampusId] = useState("");
  const [campusSelected, setCampusSelected] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    mobile: "",
    collegeName: "",
    city: "",
    message: "",
  });
  const [requestLoading, setRequestLoading] = useState(false);

  // ---- Step 2: canteen KYC ----
  const [canteenForm, setCanteenForm] = useState({
    name: "",
    contactPersonName: "",
    mobile: "",
    email: "",
    address: "",
    adhaarNumber: "",
    panNumber: "",
    gstNumber: "",
    fssaiLicense: "",
    openingHours: "",
    closingHours: "",
    operatingDays: [...WEEKDAYS.slice(0, 6)],
    description: "",
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Must have at least a partial (phone-verified) token to be here.
    if (!token) {
      navigate("/register");
      return;
    }
    // If the profile is already fully complete, there's nothing to do here.
    if (currentUser?.profileCompleted) {
      if (currentUser.role === Roles.Admin) navigate("/admin/dashboard");
      else if (currentUser.role === Roles.Student) navigate("/student/dashboard");
      else navigate("/dashboard/overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    (async () => {
      const data = await GetAllCampuses();
      setCampuses(data || []);
    })();
  }, []);

  const filteredCampuses = useMemo(() => {
    if (!campusInput) return [];
    return campuses.filter((c) =>
      c.name.toLowerCase().includes(campusInput.toLowerCase())
    );
  }, [campusInput, campuses]);

  const handleRequestCampus = async () => {
    setRequestLoading(true);
    try {
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
    } finally {
      setRequestLoading(false);
    }
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!role) return;
    if (!campusId) return;

    setSubmitting(true);
    const result = await dispatch(
      CompleteProfileThunk({ name, role, campus: campusId }, token, navigate)
    );
    setSubmitting(false);

    if (result && role === Roles.Vendor && !result.profileCompleted) {
      setCanteenForm((f) => ({ ...f, contactPersonName: name }));
      setStep("canteen");
    }
  };

  const handleCanteenChange = (field, value) => {
    setCanteenForm((f) => ({ ...f, [field]: value }));
  };

  const toggleOperatingDay = (day) => {
    setCanteenForm((f) => ({
      ...f,
      operatingDays: f.operatingDays.includes(day)
        ? f.operatingDays.filter((d) => d !== day)
        : [...f.operatingDays, day],
    }));
  };

  const handleCanteenSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 1) {
      return;
    }
    const fd = new FormData();
    Object.entries(canteenForm).forEach(([key, value]) => {
      if (key === "operatingDays") {
        fd.append(key, JSON.stringify(value));
      } else {
        fd.append(key, value);
      }
    });
    fd.append("campus", campusId);
    images.forEach((img) => fd.append("images", img));

    setSubmitting(true);
    await dispatch(CreateCanteenProfile(fd, token, navigate));
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white flex justify-center items-center p-8">
      <div className="w-full max-w-lg">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          {step === "basic" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Almost there!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Tell us a bit about yourself to finish setting up your account
                </p>
              </div>

              <form onSubmit={handleBasicSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole(Roles.Student)}
                      className={`py-3 rounded-xl border font-medium transition-all ${
                        role === Roles.Student
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-red-300"
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(Roles.Vendor)}
                      className={`py-3 rounded-xl border font-medium transition-all ${
                        role === Roles.Vendor
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-red-300"
                      }`}
                    >
                      Campus Partner
                    </button>
                  </div>
                </div>

                {/* Campus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    College / Campus
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="text"
                      placeholder="Type your campus name"
                      value={
                        campusSelected && campuses.find((c) => c._id === campusId)
                          ? campuses.find((c) => c._id === campusId).name +
                            (campuses.find((c) => c._id === campusId).city
                              ? ` (${campuses.find((c) => c._id === campusId).city})`
                              : "")
                          : campusInput
                      }
                      readOnly={campusSelected}
                      onChange={(e) => {
                        setCampusInput(e.target.value);
                        setCampusSelected(false);
                        setCampusId("");
                      }}
                      className={`pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                    />
                    {campusSelected && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-xl"
                        onClick={() => {
                          setCampusInput("");
                          setCampusSelected(false);
                          setCampusId("");
                        }}
                      >
                        ×
                      </button>
                    )}

                    {!campusSelected && campusInput && filteredCampuses.length > 0 && (
                      <div className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                        {filteredCampuses.map((campus) => (
                          <div
                            key={campus._id}
                            className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                            onClick={() => {
                              setCampusInput(
                                campus.name + (campus.city ? ` (${campus.city})` : "")
                              );
                              setCampusId(campus._id);
                              setCampusSelected(true);
                            }}
                          >
                            {campus.name}{" "}
                            {campus.city && (
                              <span className="text-gray-400 text-sm">({campus.city})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!campusSelected && campusInput && filteredCampuses.length === 0 && (
                      <div className="mt-2">
                        <button
                          type="button"
                          className="text-blue-500 hover:text-blue-600 underline text-sm"
                          onClick={() => setShowRequestDialog(true)}
                        >
                          Can't find your campus?{" "}
                          <span className="font-semibold">Request to add it</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !role || !campusId}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:hover:scale-100"
                >
                  {submitting ? "Saving..." : "Continue"}
                </button>
              </form>
            </>
          )}

          {step === "canteen" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Tell us about your canteen
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  These details will be reviewed before your canteen goes live
                </p>
              </div>

              <form onSubmit={handleCanteenSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Canteen Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Foodies Corner"
                    value={canteenForm.name}
                    onChange={(e) => handleCanteenChange("name", e.target.value)}
                    className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={canteenForm.contactPersonName}
                      onChange={(e) => handleCanteenChange("contactPersonName", e.target.value)}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Mobile
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={canteenForm.mobile}
                      onChange={(e) =>
                        handleCanteenChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={canteenForm.email}
                    onChange={(e) => handleCanteenChange("email", e.target.value)}
                    className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={canteenForm.address}
                    onChange={(e) => handleCanteenChange("address", e.target.value)}
                    className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      value={canteenForm.adhaarNumber}
                      onChange={(e) => handleCanteenChange("adhaarNumber", e.target.value)}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={canteenForm.panNumber}
                      onChange={(e) => handleCanteenChange("panNumber", e.target.value)}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={canteenForm.gstNumber}
                      onChange={(e) => handleCanteenChange("gstNumber", e.target.value)}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      FSSAI License (optional)
                    </label>
                    <input
                      type="text"
                      value={canteenForm.fssaiLicense}
                      onChange={(e) => handleCanteenChange("fssaiLicense", e.target.value)}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" /> Opening Time
                    </label>
                    <input
                      type="time"
                      value={canteenForm.openingHours}
                      onChange={(e) => handleCanteenChange("openingHours", e.target.value)}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${inputClass}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" /> Closing Time
                    </label>
                    <input
                      type="time"
                      value={canteenForm.closingHours}
                      onChange={(e) => handleCanteenChange("closingHours", e.target.value)}
                      className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${inputClass}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operating Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleOperatingDay(day)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          canteenForm.operatingDays.includes(day)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="inline w-4 h-4 mr-1" /> Description (optional)
                  </label>
                  <textarea
                    value={canteenForm.description}
                    onChange={(e) => handleCanteenChange("description", e.target.value)}
                    rows={3}
                    className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${inputClass}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Upload className="inline w-4 h-4 mr-1" /> Canteen Photos (1-3)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))}
                    className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${inputClass}`}
                  />
                  {images.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">Please add at least 1 photo</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:hover:scale-100"
                >
                  {submitting ? "Submitting..." : "Finish & Submit for Approval"}
                </button>
              </form>
            </>
          )}
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
                  onChange={(e) => setRequestForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={requestForm.email}
                  onChange={(e) => setRequestForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={requestForm.mobile}
                  onChange={(e) => setRequestForm((f) => ({ ...f, mobile: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="College Name"
                  value={requestForm.collegeName}
                  onChange={(e) => setRequestForm((f) => ({ ...f, collegeName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={requestForm.city}
                  onChange={(e) => setRequestForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Message (optional)"
                  value={requestForm.message}
                  onChange={(e) => setRequestForm((f) => ({ ...f, message: e.target.value }))}
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
      </div>
    </div>
  );
}
