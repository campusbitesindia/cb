// Central place for the backend base URL. Switches automatically between
// local and production based on VITE_APP_BASE_URL, which is set per-environment
// in .env.development / .env.production (see frontend2/README section on envs).
export const Baseurl = import.meta.env.VITE_APP_BASE_URL;

// Base URL of the frontend itself (used for building shareable links, e.g.
// group order invite links). Works correctly in both local and production
// without needing a separate env var.
export const FrontendUrl = typeof window !== "undefined" ? window.location.origin : "";

// The Socket.IO server runs on the same backend process/port as the REST
// API, just without the "/api/v1" prefix - so we derive it from Baseurl
// instead of needing a separately-configured env var (which was previously
// missing entirely, causing socket.io-client to silently fall back to the
// page's own origin and loop forever trying to handshake with the frontend
// dev server).
export const SocketUrl = Baseurl.replace(/\/api\/v1\/?$/, "");

export const AuthApi = {
  RegisterVendorapi: Baseurl + "/canteens/create",
  getProfileDetails: Baseurl + "/users/profile",
  updateUserProfile: Baseurl + "/users/profile",
  updateProfilePic: Baseurl + "/users/profile/image",
  BankDetailsapi: Baseurl + "/bank-details/",

  // Phone number + OTP authentication (current auth system)
  sendOtpApi: Baseurl + "/users/phone/send-otp",
  verifyOtpApi: Baseurl + "/users/phone/verify-otp",
  completeProfileApi: Baseurl + "/users/complete-profile",

  // DEPRECATED - kept only for reference, no longer used by the frontend
  Loginapi: Baseurl + "/users/login",
  SignUpapi: Baseurl + "/users/register",
  verifyEmailOtpApi: Baseurl + "/users/verify-email",
  sendForgotMail: Baseurl + "/users/forgotPass",
  resetPassword: Baseurl + "/users/resetPassword",
};
export const CampusApi = {
  CampusRequestApi: Baseurl + "/campuses/request",
  GetAllCampuses: Baseurl + "/campuses/",
  createCampus: Baseurl + "/campuses/create",
};

export const CanteenApi = {
  getAllCanteenApi: Baseurl + "/canteens",
  getCanteenDetail: Baseurl + "/canteens",
};

export const notificationApi = {
  getPublicKey: Baseurl + "/notifications/publicKey",
  saveSubsciption: Baseurl + "/notifications/subscribe",
};

export const OrderApi = {
  GetCanteenAllOrders: Baseurl + "/order/getCanteenAllOrders",
  ChangeOrderStatus: Baseurl + "/order/ChangeStatus",
  orderDetails: Baseurl + "/order/getOrderDetails",
  getStudentAllOrders: Baseurl + "/order/getStudentAllOrders",
  CreateOrder: Baseurl + "/order/CreateOrder",
  deleteOrder: Baseurl + "/order/deleteOrder",
  getDeletedOrders: Baseurl + "/order/getDeletedOrders",
};

export const MenuApi = {
  getCanteenMenu: Baseurl + "/items/getItems",
  CreateMenuItem: Baseurl + "/items/CreateItem",
  EditMenuItem: Baseurl + "/items/updateItem",
  DeleteItem: Baseurl + "/items/deleteItem",
  QuickBitesapi: Baseurl + "/items/allReadyItems",
};
export const payoutsapi = {
  getBalanceApi: Baseurl + "/payouts/balance",
  getRequestApi: Baseurl + "/payouts/request",
  getPayoutHistory: Baseurl + "/payouts/history",
  getPayoutStatus: Baseurl + "/payouts/status",
};

export const VendorAnalytics = {
  Analyticapi: Baseurl + "/vendorAnalytics",
};

export const AdminApi = {
  // Totals and general stats
  totalsApi: Baseurl + "/admin/totals",

  // User analytics
  monthlyUserCountApi: Baseurl + "/admin/users/monthly",
  userCountByRoleApi: Baseurl + "/admin/users/count-by-role",
  suspectedUserApi: Baseurl + "/admin/users/getSuspectedUser",
  topSpendersApi: Baseurl + "/admin/users/top-spenders",
  usersByRoleListApi: Baseurl + "/admin/users/list-by-role",

  // Order analytics
  monthlyOrdersApi: Baseurl + "/admin/orders/monthly",
  ordersByCampusCanteenApi: Baseurl + "/admin/orders/by-campus-canteen",
  orderStatusBreakdownApi: Baseurl + "/admin/orders/status-wise",
  topCanteensByOrderVolumeApi: Baseurl + "/admin/orders/top-tcanteens",
  averageOrderValueApi: Baseurl + "/admin/orders/average-order-value",
  peakOrderTimesApi: Baseurl + "/admin/orders/peak-hours",

  // Revenue analytics
  totalRevenueApi: Baseurl + "/admin/revenue/total",
  revenueByCampusCanteenApi: Baseurl + "/admin/revenue/by-campus-canteen",
  topCanteensByRevenueApi: Baseurl + "/admin/revenue/top-canteens",
  topCampusesByRevenueApi: Baseurl + "/admin/revenue/top-campuses",
  revenueByPaymentMethodApi: Baseurl + "/admin/revenue/payment-breakdown",
  dailyRevenueApi: Baseurl + "/admin/revenue/daily",
  weeklyRevenueApi: Baseurl + "/admin/revenue/weekly",
  monthlyRevenueApi: Baseurl + "/admin/revenue/monthly",

  // User management
  banUserApi: Baseurl + "/admin/banUser",

  // Canteen management
  suspendCanteenApi: Baseurl + "/admin/suspendCanteen",

  // Vendor management
  rateVendorsApi: Baseurl + "/admin/rateVendors",
  pendingVendorsApi: Baseurl + "/admin/vendors/pending",
  approveVendorApi: Baseurl + "/admin/vendors", // Note: requires /:canteenId/approve
  vendorDetailsApi: Baseurl + "/admin/vendors", // Note: requires /:canteenId/details

  // Admin account management
  createAdminApi: Baseurl + "/admin/create-admin",
  adminLoginApi: Baseurl + "/admin/login",

  // Campus management
  createCampusapi: Baseurl + "/campuses/create",
  campusesSummaryApi: Baseurl + "/admin/campuses-summary",
  campusUsersApi: Baseurl + "/admin/campus", // Note: requires /:campusId/users
  campusCanteensApi: Baseurl + "/admin/campus", // Note: requires /:campusId/canteens
  submitCampusRequestApi: Baseurl + "/admin/campus-request",
  campusRequestsApi: Baseurl + "/admin/campus-requests",
  reviewCampusRequestApi: Baseurl + "/admin/campus-requests", // Note: requires /:id/review

  // General data
  userDetailsApi: Baseurl + "/admin/user", // Note: requires /:userId
  canteenDetailsApi: Baseurl + "/admin/canteen", // Note: requires /:canteenId
  allCanteensApi: Baseurl + "/admin/canteens",

  // Payout management
  createPayoutApi: Baseurl + "/admin/payouts",
  getPayoutsApi: Baseurl + "/admin/payouts",
  payoutsByCanteenApi: Baseurl + "/admin/payouts/canteen", // Note: requires /:canteenId

  // Bank details management
  getAllBankDetailsApi: Baseurl + "/bank-details/admin/all",
  verifyBankDetailsApi: Baseurl + "/bank-details/admin", // Note: requires /:bankDetailsId/verify
};

export const PaymentApi = {
  createOrder: Baseurl + "/payments/create-order",
  verifyPayment: Baseurl + "/payments/verify",
  paymentFailure: Baseurl + "/payments/failure",
  getTransaction: Baseurl + "/payments/transaction/:transactionId",
  getUserTransactions: Baseurl + "/payments/transactions",
  initiateRefund: Baseurl + "/payments/refund/:transactionId",
  getRefundStatus: Baseurl + "/payments/refund/:transactionId",
  createCODTransaction: Baseurl + "/payments/COD",
};

export const ReviewApi = {
  getCanteenReviews: Baseurl + "/reviews",
  createReview: Baseurl + "/reviews/create",
  getItemReviews: Baseurl + "/reviews/item-reviews",
  getItemAverageRating: Baseurl + "/reviews/item-average-rating",
  getCanteenAverageRating: Baseurl + "/reviews/canteen-average-rating",
  deleteReview: Baseurl + "/reviews/delete",
};

export const SearchApi = {
  searchAll: Baseurl + `/search`,
};
export const OfferApi = {
  createOffer: Baseurl + "/offers/create",
  updateOffer: Baseurl + "/offers/update", // Note: requires /:id
  getAllOffers: Baseurl + "/offers/getAllOffers",
  getActiveOffer: Baseurl + "/offers/getActiveOffer",
};
