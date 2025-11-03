const Baseurl = "https://cbbackend-kvp6.onrender.com/api/v1";

export const AuthApi = {
  RegisterVendorapi: Baseurl + "/canteens/create",
  Loginapi: Baseurl + "/users/login",
  SignUpapi: Baseurl + "/users/register",
  getProfileDetails: Baseurl + "/users/profile",
  updateUserProfile: Baseurl + "/users/profile",
  updateProfilePic: Baseurl + "/users/profile/image",
  BankDetailsapi: Baseurl + "/bank-details/",
  verifyOtpApi: Baseurl + "/users/verify-email",
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
  createCampusapi:Baseurl+"/campuses/create",
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

export const SearchApi={
  searchAll:Baseurl+`/search`

}