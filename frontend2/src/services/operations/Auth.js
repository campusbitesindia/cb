import toast, { ToastIcon } from "react-hot-toast";
import apiConnector from "../apiConnector";
import { AdminApi, AuthApi, CampusApi } from "../api";
import { ResetProfile, setBankDetails, setProfile } from "../../slices/Profile";

import { Roles } from "../../constants/constant";
import {
  setCanteen,
  setCanteenId,
  ResetCanteen,
} from "../../slices/CanteenSlice";
import { Reset, setToken, setUser } from "../../slices/authSlice";

export const LogOutUser = (dispatch, navigate) => {
  localStorage.clear();
  dispatch(Reset());

  dispatch(ResetCanteen());
  dispatch(ResetProfile());
  navigate("/");
};

// ============================================================
// Phone Number + OTP Authentication (current auth system)
// ============================================================

const navigateByRole = (navigate, role) => {
  if (role === Roles.Admin) navigate("/admin/dashboard");
  else if (role === Roles.Student) navigate("/student/dashboard");
  else if (role === Roles.Vendor) navigate("/dashboard/overview");
  else navigate("/");
};

// Sends an OTP to the given 10 digit phone number.
// purpose: "signup" | "login"
// Returns true/false so calling components can decide what to do next
// (e.g. move to the OTP-entry step).
export const SendPhoneOtp = (phone, purpose) => {
  return async () => {
    const toastId = toast.loading("Sending OTP...");
    let result = { success: false, retryAfter: 0 };
    try {
      const response = await apiConnector(AuthApi.sendOtpApi, "POST", {
        phone,
        purpose,
      });
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      toast.success("OTP sent to your phone");
      result = { success: true, retryAfter: 0 };
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
      // If the server is enforcing a resend cooldown, sync our local timer
      // with it so the button reflects the real wait time (e.g. after a
      // page refresh resets the client-side countdown but the server still
      // remembers the last request).
      result = { success: false, retryAfter: err?.response?.data?.retryAfter || 0 };
    }
    toast.dismiss(toastId);
    return result;
  };
};

// Verifies the OTP for a signup attempt. On success, a "partial" JWT + user
// (profileCompleted: false) is stored, and the caller should navigate to
// /complete-profile to finish onboarding.
export const VerifySignupOtp = (phone, otp, navigate, redirectPath = "/complete-profile") => {
  return async (dispatch) => {
    const toastId = toast.loading("Verifying OTP...");
    try {
      const response = await apiConnector(AuthApi.verifyOtpApi, "POST", {
        phone,
        otp,
        purpose: "signup",
      });
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("User", JSON.stringify(response.data.user));

      toast.success("Phone verified! Let's finish setting up your account.");
      navigate(redirectPath);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    }
    toast.dismiss(toastId);
  };
};

// Verifies the OTP for a login attempt. On success, either logs the user in
// fully (if their profile is already complete) or sends them to finish
// onboarding (if they verified their phone during signup but never
// completed their profile).
export const VerifyLoginOtp = (phone, otp, navigate) => {
  return async (dispatch) => {
    const toastId = toast.loading("Verifying OTP...");
    try {
      const response = await apiConnector(AuthApi.verifyOtpApi, "POST", {
        phone,
        otp,
        purpose: "login",
      });
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("User", JSON.stringify(response.data.user));

      if (!response.data.profileCompleted) {
        toast.success("Almost there! Let's finish setting up your account.");
        navigate("/complete-profile");
        return;
      }

      toast.success("Login successful!");
      navigateByRole(navigate, response.data.user.role);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      toast.dismiss(toastId);
    }
  };
};

// Completes onboarding for a phone-verified user: name, role, campus.
// Students are fully done after this. Canteen owners get redirected to
// finish their canteen KYC details (handled by the calling component).
export const CompleteProfile = (data, token, navigate) => {
  return async (dispatch) => {
    const toastId = toast.loading("Saving your details...");
    let result = null;
    try {
      const response = await apiConnector(
        AuthApi.completeProfileApi,
        "POST",
        data,
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("User", JSON.stringify(response.data.user));

      result = response.data;

      if (response.data.profileCompleted) {
        toast.success("Profile completed successfully!");
        navigateByRole(navigate, response.data.user.role);
      } else {
        toast.success("Almost done! Add your canteen details to finish up.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
    toast.dismiss(toastId);
    return result;
  };
};

// Submits canteen KYC details (multipart/form-data with images) for a user
// who has already completed the "role: canteen" step of CompleteProfile.
// Marks the profile fully complete on success.
export const CreateCanteenProfile = (formData, token, navigate) => {
  return async (dispatch) => {
    const toastId = toast.loading("Setting up your canteen...");
    try {
      const response = await apiConnector(
        AuthApi.RegisterVendorapi,
        "POST",
        formData,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Canteen created successfully! Please wait for approval.");
      navigate("/dashboard/overview");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create canteen");
      return false;
    } finally {
      toast.dismiss(toastId);
    }
  };
};

export const getUserProfileDetails = (token, navigate) => {
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        AuthApi.getProfileDetails,
        "GET",
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      if (response.data.user.role === Roles.Vendor && response.data.user.canteenId) {
        dispatch(setCanteenId(response.data.user.canteenId._id));
        dispatch(setCanteen(response.data.user.canteenId));
        localStorage.setItem(
          "Canteen",
          JSON.stringify(response.data.user.canteenId)
        );
        localStorage.setItem(
          "CanteenId",
          JSON.stringify(response.data.user.canteenId._id)
        );
      }
      // localStorage.setItem requires a key + value
      localStorage.setItem("Profile", JSON.stringify(response.data.user));
      dispatch(setProfile(response.data.user));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch profile");
      LogOutUser(dispatch, navigate);
    }
  };
};

export const UpdateUserProfile = (data, token) => {
  const toastId = toast.loading("Updating user Profile");
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        AuthApi.updateUserProfile,
        "PUT",
        data,
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      localStorage.setItem("Profile", JSON.stringify(response.data.user));
      dispatch(setProfile(response.data.user));
      toast.success("profile Updated SuccessFully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occured");
    }
    toast.dismiss(toastId);
  };
};

export const UpdateUserProfilePic = (data, token) => {
  return async (dispatch) => {
    const toastId = toast.loading("Updating profile Pic");
    try {
      const response = await apiConnector(
        AuthApi.updateProfilePic,
        "POST",
        data,
        { Authorization: `Bearer ${token}` },
        {
          "Content-Type": "multipart/form-data",
        }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      localStorage.setItem("Profile", JSON.stringify(response.data.user));
      dispatch(setProfile(response.data.user));
      toast.success("profile Updated SuccessFully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occured");
    }
    toast.dismiss(toastId);
  };
};

export const getUserBankDetails = (token) => {
  return async (dispatch) => {
    const toastId = toast.loading("fetching User BankDetails");
    try {
      const response = await apiConnector(AuthApi.BankDetailsapi, "GET", null, {
        Authorization: `Bearer ${token}`,
      });
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setBankDetails(response.data.data));
      toast.success("bank Details fetched SuccessFully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occured");
    }
    toast.dismiss(toastId);
  };
};

export const CreateBankDetails = (data, token) => {
  return async (dispatch) => {
    const toastId = toast.loading("Adding Bank Details");
    try {
      const response = await apiConnector(
        AuthApi.BankDetailsapi,
        "POST",
        data,
        { Authorization: `Bearer ${token}` }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setBankDetails(response.data.user));
      toast.success("Bank Details added SuccessFully SuccessFully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occured");
    }
    toast.dismiss(toastId);
  };
};

export const RequestCampus = (data) => {
  return async (dispatch) => {
    const toastId = toast.loading("Sending your Request");
    try {
      const response = await apiConnector(
        AdminApi.submitCampusRequestApi,
        "POST",
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Request Sent SuccessFully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occurred");
    }
    toast.dismiss(toastId);
  };
};

export const GetAllCampuses = async () => {
  let result = [];
  try {
    const response = await apiConnector(CampusApi.GetAllCampuses, "GET");
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (err) {
    toast.error(err?.response?.data?.message);
  }
  return result;
};
