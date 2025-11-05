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

export const VerifyOtp = (data, setOtpDialog, navigate) => {
  return async (dispatch) => {
    const toastId = toast.loading("verifying Otp...");
    try {
      const response = await apiConnector(AuthApi.verifyOtpApi, "POST", data);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      toast.success("Otp verified SuccessFully,please login to you account");
      setOtpDialog(false);
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
    toast.dismiss(toastId);
  };
};

export const Login = (data, navigate) => {
  const toastId = toast.loading("please Wait..");
  return async (dispatch) => {
    try {
      const response = await apiConnector(AuthApi.Loginapi, "POST", data);

      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user1));

      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("User", JSON.stringify(response.data.user1));

      toast.success("Login successful!");

      response.data.user1.role === Roles.Admin
        ? navigate("/admin/dashboard")
        : response.data.user1 === Roles.Student
        ? navigate("/student/dashboard")
        : navigate("/dashboard/overview");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login Failed");
    }
    toast.dismiss(toastId);
  };
};
export const registerVendor = (data, navigate) => {
  const toastId = toast.loading("Registring Canteen");

  return async (dispatch) => {
    try {
      const response = await apiConnector(
        AuthApi.RegisterVendorapi,
        "POST",
        data
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Canteen Created SuccessFully,Please Wait For approval");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "error Occurered");
    }
    toast.dismiss(toastId);
  };
};
export const RegisterUser = (data) => {
  return async (dispatch) => {
    const toastId = toast.loading("Creating Account Please Wait");
    try {
      const response = await apiConnector(AuthApi.SignUpapi, "POST", data);
      if (!response.data.message) {
        throw new Error(response.data.message);
      }
      toast.success("Plese Verify Otp");
    } catch (err) {
      toast.error(err?.response?.data?.message || "error occurred at SignUp");
    }
    toast.dismiss(toastId);
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

      if (response.data.user.role === Roles.Vendor) {
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
