import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useForm } from "react-hook-form";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import OrderPage from "./component/core/dashBoard/Orders/OrderPage";
import OrderDetailsDialog from "./component/core/dashBoard/Orders/OrderDetails";
import MenuTab from "./component/core/dashBoard/Menu/MenuPage";
import Navbar from "./component/common/navbar";
import Footer from "./component/common/footer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserBankDetails,
  getUserProfileDetails,
} from "./services/operations/Auth";
import ProfilePage from "./component/core/dashBoard/profile";
import { AnalyticsTab } from "./component/core/dashBoard/Analytics/analyticPage";
import { PayoutsTab } from "./component/core/dashBoard/payouts/payout";
import LoginPage from "./pages/Login";
import OpenRoute from "./component/core/Auth/OpenRoute";
import PrivateRoute from "./component/core/Auth/privateRoute";
import { Roles } from "./constants/constant";
import RegisterPage from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import LandingPage from "./pages/LandingPage";
import AdminNavbar from "./component/common/admin-navbar";
import PaymentPage from "./pages/Payment";
import CreateGroupOrderPage from "./pages/CreateGroupOrder";
import QuickBitePage from "./pages/QuickBite";
import VendorRegisterPage from "./pages/VendorRegister";
import Orders from "./pages/Orders";
import ProfileWithErrorBoundary from "./pages/Profile";
import Cart from "./pages/Cart";
import Forgotpassword from "./pages/ForgotPassword";
import CanteenMenuPage from "./pages/CanteenMenu";
import AdminLoginPage from "./pages/admin/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/UserPage";
import AdminVendorsPage from "./pages/admin/VendorsPage";
import AdminCampusesPage from "./pages/admin/AdminCampusesPage";
import CampusDetailsPage from "./pages/admin/CampusDetailsPage";
import AdminCanteenAnalyticsPage from "./pages/admin/AdminCanteenAnalyticsPage";
import CampusUsersPage from "./pages/admin/CampusUsersPage";
import AdminPayoutsPage from "./pages/admin/PayoutsPage";
import BankDetailsVerification from "./pages/admin/BankDetailsVerfication";
import { usePushSubscription } from "./hooks/useSubsciption";
import VerifyEmailPage from "./pages/VerifyEmail";
import ForgotPasswordPage from "./pages/ResetMail";
import DashboardOverview from "./component/core/dashBoard/landingPage";
import AboutPage from "./pages/AboutUs";
import FAQPage from "./pages/FAQ";
import TermsConditionsPage from "./pages/TermsAndCondition";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import GroupOrderPage from "./pages/GroupOrder";
import AdminOffersPage from "./pages/AdminOffersPage";
function App() {
  const { token, User } = useSelector((state) => state.Auth);
  const { Profile } = useSelector((state) => state.Profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  usePushSubscription(User?._id);
  useEffect(() => {
    if (token) {
      dispatch(getUserProfileDetails(token, navigate));
    }
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen">
      {User?.role === Roles.Admin ? <AdminNavbar /> : <Navbar />}

      <main className="flex justify-center  mt-17 ">
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <OpenRoute>
                <LandingPage />
              </OpenRoute>
            }
          />
          <Route
            path="/register"
            element={
              <OpenRoute>
                <RegisterPage />
              </OpenRoute>
            }
          />
          <Route
            path="/login"
            element={
              <OpenRoute>
                <LoginPage />
              </OpenRoute>
            }
          />
          <Route
            path="/vendor-register"
            element={
              <OpenRoute>
                <VendorRegisterPage />
              </OpenRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute allowedRoles={[Roles.Student]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/group-order" element={<GroupOrderPage />} />
          <Route
            path="/student/orders"
            element={
              <PrivateRoute allowedRoles={[Roles.Student]}>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/quickbite"
            element={
              <PrivateRoute allowedRoles={[Roles.Student]}>
                <QuickBitePage />
              </PrivateRoute>
            }
          />
          <Route path="/profile" element={<ProfileWithErrorBoundary />} />

          {/* Vendor routes */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute allowedRoles={[Roles.Vendor]}>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="Orders" element={<OrderPage />} />
            <Route path="Orders/:OrderId" element={<OrderDetailsDialog />} />
            <Route path="Menu" element={<MenuTab />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="analytics" element={<AnalyticsTab />} />
            <Route path="payouts" element={<PayoutsTab />} />
          </Route>

          {/* Fallback */}
          <Route
            path="/canteen/:canteenId"
            element={
              <PrivateRoute>
                <CanteenMenuPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<p>page not found</p>} />
          <Route
            path="/cart"
            element={
              <PrivateRoute allowedRoles={[Roles.Student]}>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route path="/payment" element={<PaymentPage />} />
          <Route
            path="/account/verify-email/:email"
            element={<VerifyEmailPage />}
          />
          <Route path="/resetMail" element={<ForgotPasswordPage />} />
          <Route path="resetPassword/:token" element={<Forgotpassword />} />
          {/* admin routes */}
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="campuses" element={<AdminCampusesPage />} />
            <Route path="campuses/:campusId" element={<CampusDetailsPage />} />
            <Route
              path="canteens/:canteenId"
              element={<AdminCanteenAnalyticsPage />}
            />
            <Route
              path="campuses/:campusId/users"
              element={<CampusUsersPage />}
            />
            <Route path="payouts" element={<AdminPayoutsPage />} />
            <Route path="bank-details" element={<BankDetailsVerification />} />
            <Route path="offers" element={<AdminOffersPage />} />
          </Route>

          <Route path="/about" element={<AboutPage />} />
          <Route path="/FAQ" element={<FAQPage />} />
          <Route path="/terms" element={<TermsConditionsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
