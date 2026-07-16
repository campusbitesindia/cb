import React, { useState, useEffect, useReducer, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../component/ui/dialog";
import { Badge } from "../component/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../component/ui/card";
import { Separator } from "../component/ui/separator";
import { Textarea } from "../component/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../component/ui/alert";
import {
  Receipt,
  ChefHat,
  Package,
  CheckCircle2,
  XCircle,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Clock,
  Star,
  Heart,
  MessageSquare,
  Plus,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  Truck,
  MapPin,
  Inbox,
} from "lucide-react";
import toast from "react-hot-toast";
import apiConnector from "../services/apiConnector";
import { OrderApi, ReviewApi } from "../services/api";
import { addToCart } from "../slices/CartSlice";
// Shared Helper Functions
const statusConfigs = {
  placed: {
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: Receipt,
    label: "Order Placed",
    description: "Your order has been received",
  },
  payment_pending: {
    color: "bg-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    textColor: "text-orange-700 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: CreditCard,
    label: "Payment Pending",
    description: "Payment is pending for this order",
  },
  preparing: {
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    textColor: "text-yellow-700 dark:text-yellow-300",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: ChefHat,
    label: "Preparing",
    description: "Your food is being prepared",
  },
  ready: {
    color: "bg-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: Package,
    label: "Ready for Pickup",
    description: "Your order is ready",
  },
  completed: {
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle2,
    label: "Completed",
    description: "Order delivered successfully",
  },
  cancelled: {
    color: "bg-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
    label: "Cancelled",
    description: "Order was cancelled",
  },
};

const getStatusConfig = (status) =>
  statusConfigs[status] ?? statusConfigs.placed;

const paymentConfigs = {
  cod: {
    icon: Package,
    label: "Cash on Delivery",
    color:
      "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50",
  },
  upi: {
    icon: CreditCard,
    label: "UPI Payment",
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50",
  },
  card: {
    icon: CreditCard,
    label: "Card Payment",
    color:
      "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50",
  },
};

const getPaymentConfig = (method) =>
  paymentConfigs[method] ?? paymentConfigs.cod;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const formatDate = (dateString) => {
  if (!dateString) return "Date not available";
  const date = new Date(dateString);
  if (isNaN(date.valueOf())) return "Invalid date";
  return dateFormatter.format(date);
};

// Helper function to handle image URLs
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "/placeholder.svg";

  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If it's a relative URL, ensure it starts with /
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  // If it doesn't start with /, add it
  return `/${imageUrl}`;
};

// Review State Management
const initialReviewState = {
  showDialog: false,
  selectedItem: null,
  selectedOrder: null,
  rating: 0,
  comment: "",
  submitting: false,
  showThankYou: false,
};

function reviewReducer(state, action) {
  switch (action.type) {
    case "openDialog":
      return {
        ...state,
        showDialog: true,
        selectedItem: action.item,
        selectedOrder: action.order,
      };
    case "closeDialog":
      return {
        ...state,
        showDialog: false,
        selectedItem: null,
        selectedOrder: null,
        rating: 0,
        comment: "",
        submitting: false,
        showThankYou: false,
      };
    case "setRating":
      return { ...state, rating: action.rating };
    case "setComment":
      return { ...state, comment: action.comment };
    case "setSubmitting":
      return { ...state, submitting: action.submitting };
    case "showThankYou":
      return { ...state, showThankYou: true };
    case "reset":
      return initialReviewState;
    default:
      return state;
  }
}

// ItemReviewSelector Component
const ItemReviewSelector = memo(
  ({ order, onWriteReview, onViewReviews, hasViewedReviews }) => {
    if (!order || !order.items || order.items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No items found in this order.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {order.items.map((orderItem) => {
            const { _id, item, quantity, nameAtPurchase, priceAtPurchase } =
              orderItem;
            const { image, name: itemName } = item || {};
            const name =
              nameAtPurchase || itemName || "Item No Longer Available";
            const price = priceAtPurchase || 0;
            const itemId = typeof item === "string" ? item : item?._id;
            const hasViewed = hasViewedReviews(itemId);

            return (
              <div
                key={_id}
                className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0">
                    <img
                      src={getImageUrl(image)}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {quantity} • ₹{price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onWriteReview(orderItem)}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs"
                  >
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Write Review
                  </Button>
                  <Button
                    onClick={() => onViewReviews(orderItem)}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {hasViewed && (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                    )}
                    View Reviews
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

function OrdersPageContent() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.Auth);

  // Orders data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected order & detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Review state managed by reducer
  const [reviewState, dispatchReview] = useReducer(
    reviewReducer,
    initialReviewState
  );

  // Viewed reviews tracking
  const [viewedReviews, setViewedReviews] = useState(new Set());

  // Review dialog states
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showViewReviewDialog, setShowViewReviewDialog] = useState(false);
  const [selectedItemForViewReview, setSelectedItemForViewReview] =
    useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [existingReviews, setExistingReviews] = useState([]);
  const [selectedOrderForSelector, setSelectedOrderForSelector] =
    useState(null);
  const [showItemSelectorDialog, setShowItemSelectorDialog] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  // Store the review data for the thank you dialog
  const [thankYouReviewData, setThankYouReviewData] = useState(null);
  const fifthStarRef = useRef(null);
  const dispatch = useDispatch();
  // Load viewed reviews from localStorage on component mount
  useEffect(() => {
    const savedViewedReviews = localStorage.getItem("viewedReviews");
    if (savedViewedReviews) {
      try {
        const parsed = JSON.parse(savedViewedReviews);
        setViewedReviews(new Set(parsed));
      } catch (error) {
        console.error("Error loading viewed reviews:", error);
      }
    }
  }, []);

  // Save viewed reviews to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("viewedReviews", JSON.stringify([...viewedReviews]));
  }, [viewedReviews]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Ensure page scrolls to top when component mounts and stays there
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prevent scrolling to bottom during state changes
  useEffect(() => {
    if (!loading && orders.length > 0) {
      window.scrollTo(0, 0);
    }
  }, [loading, orders]);

  // API Integration - Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiConnector(
        OrderApi.getStudentAllOrders || "/orders/my-orders",
        "GET",
        null,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setOrders(response.data.data || response.data.orders || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch orders";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // API Integration - Get Order Details
  const fetchOrderDetails = async (orderId) => {
    setOrderDetailLoading(true);
    try {
      const response = await apiConnector(
        `${OrderApi.orderDetails}/${orderId}`,
        "GET",
        null,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        return response.data.data || response.data.order;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch order details"
        );
      }
    } catch (error) {
      console.error("Fetch order details error:", error);
      toast.error("Failed to fetch order details");
      throw error;
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);

    // Optionally fetch more detailed order info
    try {
      const detailedOrder = await fetchOrderDetails(order._id);
      setSelectedOrder(detailedOrder);
    } catch (error) {
      // If detailed fetch fails, use the basic order data
      console.error("Failed to fetch detailed order info:", error);
    }
  };

  // API Integration - Create Review
  const createReview = async (reviewData) => {
    try {
      const response = await apiConnector(
        ReviewApi.createReview,
        "POST",
        reviewData,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to create review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  // API Integration - Get Item Reviews
  const getItemReviews = async (itemId) => {
    try {
      const response = await apiConnector(
        `${ReviewApi.getItemReviews}/${itemId}`,
        "GET",
        null,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        return response.data.data || response.data.reviews || [];
      } else {
        throw new Error(response.data.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching item reviews:", error);
      throw error;
    }
  };

  // Review helper functions
  const handleWriteReview = (order, item) => {
    setSelectedOrderForReview(order);
    setSelectedItemForReview(item);
    setReviewRating(0);
    setReviewComment("");
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please add a comment");
      return;
    }
    if (!selectedItemForReview || !selectedOrderForReview) {
      toast.error("Invalid review data");
      return;
    }

    setReviewSubmitting(true);
    try {
      const itemId =
        typeof selectedItemForReview.item === "string"
          ? selectedItemForReview.item
          : selectedItemForReview.item._id;

      const reviewData = {
        canteenId: selectedOrderForReview.canteen._id,
        itemId,
        rating: reviewRating,
        comment: reviewComment.trim(),
        orderId: selectedOrderForReview._id,
      };

      await createReview(reviewData);

      // Store the review data for thank you dialog before clearing
      setThankYouReviewData({
        order: selectedOrderForReview,
        item: selectedItemForReview,
        itemId: itemId,
      });

      // Reset and close review dialog
      setShowReviewDialog(false);
      setReviewRating(0);
      setReviewComment("");
      setSelectedItemForReview(null);
      setSelectedOrderForReview(null);

      setShowThankYouDialog(true);
      toast.success(
        "Review submitted successfully! Thank you for your feedback."
      );

      // Refresh reviews if viewing same item review dialog
      if (showViewReviewDialog && selectedItemForViewReview) {
        const viewItemId =
          typeof selectedItemForViewReview.item === "string"
            ? selectedItemForViewReview.item
            : selectedItemForViewReview.item._id;
        if (viewItemId === itemId) {
          setTimeout(() => fetchItemReviews(itemId), 1000);
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // View review helper functions
  const handleViewReviews = (order, item) => {
    setShowViewReviewDialog(true);

    setSelectedOrderForReview(order);
    setSelectedItemForViewReview(item);

    const itemId = typeof item.item === "string" ? item.item : item.item._id;

    // Mark this item's reviews as viewed (frontend only)
    setViewedReviews((prev) => {
      if (prev.has(itemId)) return prev;
      return new Set(prev).add(itemId);
    });

    // Delay to ensure recent reviews are fetched
    setTimeout(() => fetchItemReviews(itemId), 500);
  };

  // Item selector helper functions
  const handleOpenItemSelector = (order) => {
    setSelectedOrderForSelector(order);
    setShowItemSelectorDialog(true);
  };

  const handleItemSelectorWriteReview = (item) => {
    if (!selectedOrderForSelector) return;
    setShowItemSelectorDialog(false);
    handleWriteReview(selectedOrderForSelector, item);
  };

  const handleItemSelectorViewReviews = (item) => {
    if (!selectedOrderForSelector) return;
    handleViewReviews(selectedOrderForSelector, item);
  };

  // Fetch item reviews from backend
  const fetchItemReviews = async (itemId) => {
    setReviewsLoading(true);
    try {
      const reviews = await getItemReviews(itemId);
      setExistingReviews(reviews);

      if (reviews.length === 0) {
        toast("No reviews found for this item yet.", { icon: "ℹ️" });
      } else {
        toast.success(`Found ${reviews.length} review(s) for this item.`);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
      setExistingReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Helper to check if item's reviews viewed (frontend only)
  const hasViewedReviews = (itemId) => viewedReviews.has(itemId);

  // Helper to clear viewed reviews and localStorage
  const clearViewedReviews = () => {
    setViewedReviews(new Set());
    localStorage.removeItem("viewedReviews");
    toast.success("Viewed reviews cleared! 🧹");
  };

  // Reorder functionality
  const handleReorder = (order) => {
    try {
      const Items = order.items.map((ele) => ele.item);
      Items.forEach((ele) => {
        dispatch(addToCart(ele));
      });
      toast.success("Items added to cart");
      navigate("/cart");
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder. Please try again.");
    }
  };

  // Memoize expensive computations
  const activeOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["placed", "preparing", "ready", "payment_pending"].includes(o.status)
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => ["completed", "cancelled"].includes(o.status)),
    [orders]
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        {/* Loading animation */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-spin" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-700 dark:text-slate-300 text-base sm:text-lg font-medium mb-1 sm:mb-2">
                Loading your orders...
              </p>
              <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
                This won't take long
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        {/* Error Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              My Orders
            </h1>
          </div>
        </div>

        {/* Error message */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto" role="alert">
            <Alert className="border-red-200/50 bg-red-50/80 dark:border-red-800/50 dark:bg-red-950/20 backdrop-blur-sm shadow-xl">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300 font-semibold text-lg">
                Oops! Something went wrong
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400 mb-6 text-base leading-relaxed">
                {error}
              </AlertDescription>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={fetchOrders}
                  variant="outline"
                  className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // Check if any review dialog is open
  const isAnyReviewDialogOpen =
    showReviewDialog ||
    showItemSelectorDialog ||
    showViewReviewDialog ||
    showThankYouDialog;

  // Check if any modal is open (including order details)
  const isAnyModalOpen = isAnyReviewDialogOpen || isDetailModalOpen;

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden transition-all duration-300 ${
        isAnyModalOpen ? "blur-sm" : ""
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12 lg:py-16 xl:py-24">
            <div className="max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl flex items-center justify-center">
                <Inbox className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-orange-500" />
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                No orders yet
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 lg:mb-8 leading-relaxed text-sm sm:text-base">
                Start your food journey by exploring our amazing campus
                restaurants and placing your first order.
              </p>

              <Button
                onClick={() => navigate("/student/dashboard")}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Browse Menu
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 lg:space-y-12">
            {/* Main Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
              <div className="container mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  My Orders
                </h1>
                <p className="text-gray-600 dark:text-slate-300 mt-1 text-sm sm:text-base">
                  Track your delicious journey across campus
                </p>
              </div>
            </div>
            {/* Utility Actions */}
            {/* <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50'>
        <div className='container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3'>
          <div className='flex justify-end'>
            {viewedReviews.size > 0 && (
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <Badge className='bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm px-2 sm:px-3 py-1'>
                  {viewedReviews.size} viewed
                </Badge>
                <Button
                  onClick={clearViewedReviews}
                  variant='ghost'
                  size='sm'
                  className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-6 px-1.5 sm:px-2'>
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </div> */}

            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Active Orders
                  </h2>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-xs sm:text-sm">
                    {activeOrders.length}
                  </Badge>
                </div>
                <div className="grid gap-3 sm:gap-4 lg:gap-6">
                  {activeOrders.map((order, index) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      index={index}
                      onViewDetails={handleViewDetails}
                      onReorder={handleReorder}
                      onOpenItemSelector={() => handleOpenItemSelector(order)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Order History Section */}
            <section>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Order History
                </h2>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm">
                  {completedOrders.length}
                </Badge>
              </div>
              <div className="grid gap-3 sm:gap-4 lg:gap-6">
                {completedOrders.map((order, index) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    index={index}
                    onViewDetails={handleViewDetails}
                    onReorder={handleReorder}
                    onOpenItemSelector={() => handleOpenItemSelector(order)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent 
        onOpenAutoFocus={(e) => {
            e.preventDefault();
            fifthStarRef.current?.focus();
          }}
        className="max-w-[98vw] xs:max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl max-h-[95vh] xs:max-h-[90vh] overflow-y-auto mx-0.5 xs:mx-1 sm:mx-4 bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-lg xs:rounded-xl sm:rounded-2xl">
          <DialogHeader className="text-center pb-2 xs:pb-3 sm:pb-6 border-b border-gray-100 dark:border-slate-800 px-2 xs:px-3 sm:px-6">
            <div className="flex justify-center mb-1 xs:mb-2 sm:mb-4">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <Star className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white fill-current" />
              </div>
            </div>
            <DialogTitle className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
              Share Your Experience
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base md:text-base text-gray-600 dark:text-gray-400 leading-relaxed px-0.5 xs:px-1 sm:px-0 mt-1 xs:mt-1 sm:mt-2">
              Tell others about your experience with{" "}
              <span className="font-semibold text-orange-600 dark:text-orange-400 break-words">
                {selectedItemForReview?.item?.name}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400 break-words">
                {selectedOrderForReview?.canteen?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitReview}
            className="space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8 pt-2 xs:pt-3 sm:pt-4 md:pt-6 px-2 xs:px-3 sm:px-6"
          >
            {/* Rating Section */}
            <div>
              <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-semibold mb-1 xs:mb-2 sm:mb-3 md:mb-4 text-gray-800 dark:text-gray-200 text-center sm:text-left">
                How would you rate this item?
              </label>
              <div className="flex items-center justify-center space-x-0.5 xs:space-x-1 sm:space-x-2 md:space-x-3 p-2 xs:p-3 sm:p-4 md:p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-lg xs:rounded-xl sm:rounded-2xl border border-yellow-200 dark:border-yellow-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    ref={star === 5 ? fifthStarRef : null}
                    type="button"
                    className="cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-1 xs:focus:ring-2 sm:focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-600 rounded-full p-0.5 xs:p-1 sm:p-1.5 md:p-2 touch-manipulation"
                    onClick={() => setReviewRating(star)}
                  >
                    <Star
                      className={`w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-all duration-300 ${
                        star <= reviewRating
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                          : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-xs xs:text-sm sm:text-base md:text-lg font-semibold mb-1 xs:mb-2 sm:mb-3 md:mb-4 text-gray-800 dark:text-gray-200 text-center sm:text-left">
                Share your thoughts
              </label>
              <div className="relative">
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you love about this item? Was it delicious? Fresh? Would you recommend it to others?"
                  rows={3}
                  maxLength={500}
                  required
                  className="resize-none border-2 border-gray-200 dark:border-slate-700 rounded-lg xs:rounded-xl sm:rounded-xl px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm sm:text-base leading-relaxed focus:border-orange-400 dark:focus:border-orange-500 focus:ring-1 xs:focus:ring-2 sm:focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 transition-all duration-300 bg-white dark:bg-slate-300 w-full min-h-[70px] xs:min-h-[80px] sm:min-h-[100px]"
                />
                <div className="absolute bottom-1 xs:bottom-2 sm:bottom-3 right-1 xs:right-2 sm:right-3 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 px-1 rounded">
                  {reviewComment.length}/500
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col xs:flex-row gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 justify-end pt-2 xs:pt-3 sm:pt-4 md:pt-6 border-t border-gray-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                className="w-full xs:w-auto px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-2.5 md:py-3 border-1 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-200 transition-all duration-300 text-xs xs:text-sm sm:text-base font-medium touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={reviewSubmitting || reviewRating === 0}
                className="w-full xs:w-auto px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-2.5 md:py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs xs:text-sm sm:text-base touch-manipulation"
              >
                {reviewSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2 animate-spin" />
                    <span className="hidden xs:inline sm:inline">
                      Saving...
                    </span>
                    <span className="xs:hidden sm:hidden">Saving</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
                    <span className="hidden xs:inline sm:inline">
                      Save Review
                    </span>
                    <span className="xs:hidden sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Review Selector Dialog */}
      <Dialog
        open={showItemSelectorDialog}
        onOpenChange={setShowItemSelectorDialog}
      >
        <DialogContent className="max-w-[98vw] xs:max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] xs:max-h-[90vh] overflow-y-auto mx-0.5 xs:mx-1 sm:mx-4 bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-lg xs:rounded-xl sm:rounded-2xl">
          <DialogHeader className="text-center pb-2 xs:pb-3 sm:pb-6 border-b border-gray-100 dark:border-slate-800 px-2 xs:px-3 sm:px-6">
            <div className="flex justify-center mb-1 xs:mb-2 sm:mb-4">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <Star className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white fill-current" />
              </div>
            </div>
            <DialogTitle className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
              Review Your Order
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base md:text-base text-gray-600 dark:text-gray-400 leading-relaxed px-0.5 xs:px-1 sm:px-0 mt-1 xs:mt-1 sm:mt-2">
              Select items from your order to review and help fellow students
              make great food choices!
            </DialogDescription>
          </DialogHeader>

          <div className="p-2 xs:p-3 sm:p-4 md:p-6">
            {selectedOrderForSelector && (
              <ItemReviewSelector
                order={selectedOrderForSelector}
                onWriteReview={handleItemSelectorWriteReview}
                onViewReviews={handleItemSelectorViewReviews}
                hasViewedReviews={hasViewedReviews}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Reviews Dialog */}
      <Dialog
        open={showViewReviewDialog}
        onOpenChange={setShowViewReviewDialog}
      >
        <DialogContent className="max-w-[98vw] xs:max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] xs:max-h-[90vh] overflow-y-auto mx-0.5 xs:mx-1 sm:mx-4 bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-lg xs:rounded-xl sm:rounded-2xl">
          <DialogHeader className="text-center pb-2 xs:pb-3 sm:pb-6 border-b border-gray-100 dark:border-slate-800 px-2 xs:px-3 sm:px-6">
            <div className="flex justify-center mb-1 xs:mb-2 sm:mb-4">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <MessageSquare className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white fill-current" />
              </div>
            </div>
            <DialogTitle className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
              Customer Reviews
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base md:text-base text-gray-600 dark:text-gray-400 leading-relaxed px-0.5 xs:px-1 sm:px-0 mt-1 xs:mt-1 sm:mt-2">
              See what other students think about{" "}
              <span className="font-semibold text-orange-600 dark:text-orange-400 break-words">
                {selectedItemForViewReview?.item?.name ||
                  selectedItemForViewReview?.nameAtPurchase}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="p-2 xs:p-3 sm:p-4 md:p-6">
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Loading reviews...
                  </p>
                </div>
              </div>
            ) : existingReviews.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2">
                  Be the first to share your experience with this item!
                </p>
                <Button
                  onClick={() => {
                    setShowViewReviewDialog(false);
                    if (selectedItemForViewReview && selectedOrderForReview) {
                      handleWriteReview(
                        selectedOrderForReview,
                        selectedItemForViewReview
                      );
                    }
                  }}
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base touch-manipulation"
                >
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  <span className="hidden sm:inline">Write First Review</span>
                  <span className="sm:hidden">Write Review</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-center sm:text-left">
                    {existingReviews.length} Review
                    {existingReviews.length !== 1 ? "s" : ""}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            star <=
                            Math.round(
                              existingReviews.reduce(
                                (sum, review) => sum + review.rating,
                                0
                              ) / existingReviews.length
                            )
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {(
                        existingReviews.reduce(
                          (sum, review) => sum + review.rating,
                          0
                        ) / existingReviews.length
                      ).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {existingReviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-600"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs sm:text-sm font-semibold">
                              {review.student?.name?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                              {review.student?.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  star <= review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed break-words">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-3 sm:pt-4 border-t border-gray-100 dark:border-slate-800">
                  <Button
                    onClick={() => {
                      setShowViewReviewDialog(false);
                      if (selectedItemForViewReview && selectedOrderForReview) {
                        handleWriteReview(
                          selectedOrderForReview,
                          selectedItemForViewReview
                        );
                      }
                    }}
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base touch-manipulation"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add Your Review</span>
                    <span className="sm:hidden">Add Review</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Thank You Dialog */}
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent className="max-w-[95vw] xs:max-w-[90vw] sm:max-w-md md:max-w-lg text-center mx-1 xs:mx-2 sm:mx-4 rounded-lg xs:rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border-0 shadow-2xl">
          <DialogHeader className="px-2 xs:px-3 sm:px-6">
            <div className="flex justify-center mb-2 xs:mb-3 sm:mb-4 md:mb-6">
              <div className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                <Heart className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white fill-current" />
              </div>
            </div>
            <DialogTitle className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 xs:mb-2 sm:mb-3 md:mb-4 leading-tight">
              Thank You! 🎉
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 text-xs xs:text-sm sm:text-base md:text-base leading-relaxed mb-3 xs:mb-4 sm:mb-6 md:mb-8 px-0.5 xs:px-1 sm:px-2 md:px-0">
              Your review has been saved successfully! Your feedback helps us
              improve our service and makes other students happy! ✨
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-6 px-2 xs:px-3 sm:px-6 pb-2 xs:pb-3 sm:pb-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-2 xs:p-2.5 sm:p-3 md:p-4 rounded-lg xs:rounded-lg sm:rounded-xl border border-orange-200 dark:border-orange-800">
              <p className="text-xs xs:text-sm sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>🌟 Your voice matters!</strong> Thanks for helping
                fellow students make great food choices.
              </p>
            </div>

            <Button
              onClick={() => {
                setShowThankYouDialog(false);
                if (thankYouReviewData) {
                  handleViewReviews(
                    thankYouReviewData.order,
                    thankYouReviewData.item
                  );
                  setThankYouReviewData(null);
                }
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-2.5 xs:py-3 sm:py-2.5 md:py-3 mb-1 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base touch-manipulation"
            >
              <MessageSquare className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
              <span className="hidden xs:inline sm:inline">View My Review</span>
              <span className="xs:hidden sm:hidden">View Review</span>
            </Button>
            <Button
              onClick={() => {
                setShowThankYouDialog(false);
                setThankYouReviewData(null);
              }}
              variant="outline"
              className="w-full border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 shadow-lg hover:shadow-xl transition-all duration-300 py-2.5 xs:py-3 sm:py-2.5 md:py-3 text-xs xs:text-sm sm:text-base touch-manipulation"
            >
              <span className="hidden xs:inline sm:inline">
                Continue Exploring
              </span>
              <span className="xs:hidden sm:hidden">Continue</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-[98vw] xs:max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] xs:max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 mx-0.5 xs:mx-1 sm:mx-2 md:mx-4 p-0 rounded-lg xs:rounded-xl sm:rounded-2xl">
          {orderDetailLoading ? (
            <>
              <DialogHeader className="px-2 xs:px-3 sm:px-4 md:px-6">
                <DialogTitle className="text-base xs:text-lg sm:text-xl">
                  Loading Order Details...
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center py-8 xs:py-12 sm:py-20">
                <Loader2 className="h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 animate-spin text-orange-500" />
              </div>
            </>
          ) : selectedOrder ? (
            <>
              <DialogHeader className="border-b pb-2 xs:pb-3 sm:pb-4 md:pb-6 dark:border-slate-700 p-2 xs:p-3 sm:p-4 md:p-6">
                <div className="flex flex-col xs:flex-col sm:flex-row sm:items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
                  <div
                    className={`w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 ${
                      getStatusConfig(selectedOrder.status).color
                    } rounded-lg xs:rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg mx-auto xs:mx-auto sm:mx-0`}
                  >
                    {(() => {
                      const StatusIcon = getStatusConfig(
                        selectedOrder.status
                      ).icon;
                      return (
                        <StatusIcon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      );
                    })()}
                  </div>
                  <div className="text-center xs:text-center sm:text-left flex-1">
                    <DialogTitle className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      Order #{selectedOrder?.OrderNumber?.replace("order#", "")}
                    </DialogTitle>
                    <p className="text-xs xs:text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-0.5 xs:mt-1">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                    <div className="flex items-center justify-center xs:justify-center sm:justify-start gap-1.5 xs:gap-2 mt-1 xs:mt-2">
                      <Badge
                        className={`${
                          getStatusConfig(selectedOrder.status).bgColor
                        } ${
                          getStatusConfig(selectedOrder.status).textColor
                        } border-0 px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 font-semibold text-xs xs:text-xs sm:text-sm`}
                      >
                        {getStatusConfig(selectedOrder.status).label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="p-2 xs:p-3 sm:p-4 md:p-6">
                <OrderDetailsContent order={selectedOrder} />
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="px-2 xs:px-3 sm:px-4 md:px-6">
                <DialogTitle className="text-base xs:text-lg sm:text-xl">
                  Order Details
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center py-8 xs:py-12 sm:py-20">
                <p className="text-gray-500 dark:text-gray-400 text-sm xs:text-base">
                  No order selected
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const btnBase =
  "w-full sm:w-auto h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300";

// Enhanced Order Card Component
const OrderCard = memo(
  ({ order, index, onViewDetails, onReorder, onOpenItemSelector }) => {
    const statusConfig = useMemo(
      () => getStatusConfig(order.status),
      [order.status]
    );
    const StatusIcon = statusConfig.icon;
    const maxVisible = 3;

    return (
      <div className="relative overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl group rounded-2xl">
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Header */}
        <CardHeader
          className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-b-2 relative z-10 p-4 sm:p-6 rounded-t-2xl`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            {/* Left: Status Icon & Order Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${statusConfig.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {order?.OrderNumber}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {formatDate(order.createdAt)}
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* Right: Status Badge & Payment Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <Badge
                className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 px-2 sm:px-3 md:px-4 py-1 sm:py-2 font-semibold text-xs sm:text-sm`}
              >
                {statusConfig.label}
              </Badge>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{order.total.toFixed(2)}
                </div>
                {order.payment && (
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
                    {getPaymentConfig(order.payment.method).label}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 relative z-10">
          {/* Restaurant Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  {order.canteen?.name ?? "Unknown Restaurant"}
                </span>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Campus Restaurant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 lg:mb-8">
            {order.items
              .slice(0, maxVisible)
              .map(
                (
                  { _id, item, quantity, nameAtPurchase, priceAtPurchase },
                  idx
                ) => {
                  const {
                    name = nameAtPurchase || "Item No Longer Available",
                    image,
                    price = priceAtPurchase || 0,
                  } = item || {};
                  return (
                    <div
                      key={_id}
                      className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-white/80 via-gray-50/60 to-white/80 dark:from-slate-700/60 dark:via-slate-800/40 dark:to-slate-700/60 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm border border-gray-100/80 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 shadow-lg">
                          <img
                            src={getImageUrl(image)}
                            alt={name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg";
                            }}
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg truncate mb-1">
                            {name}
                          </h4>
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                            <span className="bg-gray-200/80 dark:bg-slate-600/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">
                              Qty: {quantity}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                              •
                            </span>
                            <span className="font-medium">
                              ₹{(priceAtPurchase || price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">
                          ₹{(quantity * (priceAtPurchase || price)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}

            {order.items.length > maxVisible && (
              <div className="text-center py-2 sm:py-3 md:py-4 text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base font-medium bg-gradient-to-r from-gray-50/60 via-white/40 to-gray-50/60 dark:from-slate-700/40 dark:via-slate-800/30 dark:to-slate-700/40 rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100/80 dark:border-slate-600/50">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span>
                    {order.items.length - maxVisible} more item
                    {order.items.length - maxVisible !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Footer */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">
                {statusConfig.description}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {/* View Details Button */}
              <Button
                variant="outline"
                size="sm"
                className={`${btnBase} bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 border-red-600 dark:border-red-700`}
                onClick={() => onViewDetails(order)}
              >
                <span className="sm:hidden">Details</span>
                <span className="hidden sm:inline">View Details</span>
              </Button>

              {/* Completed Order Actions */}
              {order.status === "completed" && (
                <>
                  <Button
                    onClick={onOpenItemSelector}
                    variant="outline"
                    size="sm"
                    className={`${btnBase} bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 dark:bg-red-700 dark:border-red-800 dark:hover:bg-red-800 shadow-lg hover:shadow-xl font-semibold`}
                  >
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 fill-current" />
                    <span className="sm:hidden">Review</span>
                    <span className="hidden sm:inline">Write Reviews</span>
                  </Button>

                  <Button
                    onClick={() => onReorder(order)}
                    size="sm"
                    className={`${btnBase} bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl font-semibold`}
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Reorder
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    );
  }
);

// Memoized Order Details Content Component
const OrderDetailsContent = memo(({ order }) => {
  if (!order) return null;

  const isCompleted = (statuses) => statuses.includes(order.status);
  const isCurrentStatus = (status) => order.status === status;

  const getOrderTimeline = () => {
    const baseSteps = [
      {
        status: "placed",
        label: "Order Placed",
        icon: Receipt,
        isComplete: isCompleted(["placed", "preparing", "ready", "completed"]),
      },
      {
        status: "preparing",
        label: "Preparing",
        icon: ChefHat,
        isComplete: isCompleted(["preparing", "ready", "completed"]),
      },
      {
        status: "ready",
        label: "Ready",
        icon: Package,
        isComplete: isCompleted(["ready", "completed"]),
      },
      {
        status: "completed",
        label: "Completed",
        icon: CheckCircle2,
        isComplete: order.status === "completed",
      },
    ];

    if (order.status === "payment_pending") {
      return [
        {
          status: "payment_pending",
          label: "Payment Pending",
          icon: CreditCard,
          isComplete: true,
        },
      ];
    }

    if (order.status === "cancelled") {
      return [
        {
          status: "placed",
          label: "Order Placed",
          icon: Receipt,
          isComplete: true,
        },
        {
          status: "cancelled",
          label: "Cancelled",
          icon: XCircle,
          isComplete: true,
        },
      ];
    }

    return baseSteps;
  };

  const timeline = getOrderTimeline();
  const maxVisible = 3;
  const progress =
    timeline.filter((step) => step.isComplete).length / timeline.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <Truck className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            Order Timeline
          </h3>

          <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 relative">
            <div className="absolute left-3 sm:left-4 md:left-5 lg:left-6 top-3 sm:top-4 md:top-5 lg:top-6 bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700">
              <div
                className="bg-gradient-to-b from-green-500 to-blue-500 w-full origin-top transition-all duration-500"
                style={{ transform: `scaleY(${progress})` }}
              />
            </div>

            {timeline.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = step.isComplete;
              const isCurrent = isCurrentStatus(step.status);

              return (
                <div
                  key={step.status}
                  className="flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10"
                >
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 sm:border-3 md:border-4 border-white dark:border-slate-900 shadow-lg transition-all duration-300 ${
                      isCompleted
                        ? step.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-green-500"
                        : "bg-gray-200 dark:bg-slate-700"
                    }`}
                  >
                    <StepIcon
                      className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ${
                        isCompleted
                          ? "text-white"
                          : "text-gray-400 dark:text-slate-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-xs sm:text-sm md:text-base ${
                        isCompleted
                          ? "text-gray-800 dark:text-gray-200"
                          : "text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {step.label}
                    </div>

                    {isCompleted && isCurrent && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Current Status
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-500" />
            Order Summary
          </h3>

          <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 lg:mb-8">
            {order.items.slice(0, maxVisible).map((orderItem, idx) => {
              const { _id, item, quantity, nameAtPurchase, priceAtPurchase } =
                orderItem;
              const { image, name: itemName } = item || {};
              const name =
                nameAtPurchase || itemName || "Item No Longer Available";
              const price = priceAtPurchase || 0;

              return (
                <div
                  key={_id}
                  className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-gray-50/90 via-white/50 to-gray-50/90 dark:from-slate-700/50 dark:via-slate-800/30 dark:to-slate-700/50 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 shadow-lg">
                      <img
                        src={getImageUrl(image)}
                        alt={name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg truncate mb-1">
                        {name}
                      </h4>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        <span className="bg-gray-200 dark:bg-slate-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-medium">
                          Qty: {quantity}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">
                          •
                        </span>
                        <span className="font-medium">₹{price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">
                      ₹{(quantity * price).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}

            {order.items.length > maxVisible && (
              <div className="text-center py-2 sm:py-3 md:py-4 text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base font-medium bg-gradient-to-r from-gray-50/50 via-white/30 to-gray-50/50 dark:from-slate-700/30 dark:via-slate-800/20 dark:to-slate-700/30 rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-100 dark:border-slate-600">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span>
                    {order.items.length - maxVisible} more item
                    {order.items.length - maxVisible !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Order Total Breakdown */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-blue-100 dark:border-blue-800 mb-4 sm:mb-6 lg:mb-8">
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              Order Total
            </h4>

            <div className="space-y-2 sm:space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal ({order.items.length} items)
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  ₹
                  {order.items
                    .reduce(
                      (sum, item) =>
                        sum + item.quantity * (item.priceAtPurchase || 0),
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>

              <Separator className="my-2 sm:my-3 md:my-4" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  Total Amount
                </span>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    ₹{order.total.toFixed(2)}
                  </span>
                  {order.payment && (
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                      Paid via {getPaymentConfig(order.payment.method).label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Main page component
export default function OrdersPage() {
  return <OrdersPageContent />;
}
