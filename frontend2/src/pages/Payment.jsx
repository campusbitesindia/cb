import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../component/ui/button";
import { Label } from "../component/ui/label";
import { clearCart } from "../slices/CartSlice";
import { RadioGroup, RadioGroupItem } from "../component/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../component/ui/card";
import {
  ArrowLeft,
  Smartphone,
  Truck,
  Loader2,
  Shield,
  CheckCircle,
  FileText,
} from "lucide-react";
import apiConnector from "../services/apiConnector";
import { OrderApi, PaymentApi } from "../services/api";
import toast from "react-hot-toast";
import { useSocket } from "../context/Socket";
import { RefundPolicyModal } from "../component/common/RefundPolicyModal";

export default function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { token } = useSelector((state) => state.Auth);
  const { disconnectSocket } = useSocket();
  // State
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  // Query param
  const orderId = searchParams.get("orderId");

  // Fetch order details
  useEffect(() => {
    async function getOrderDetails() {
      if (!orderId) return;
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
        console.log(response);
        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to get order details"
          );
        }

        const filteredData = {
          id: response.data.data._id,
          total: response.data.data.total,
        };
        setOrderDetails(filteredData);
      } catch (err) {
        console.error("Order fetch error:", err);
        toast.error(err.message || "Failed to load order details.");
      }
    }
    getOrderDetails();
  }, [orderId, token]);

  // Loading state
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 font-semibold">
          Order ID is missing. Please access from the valid link.
        </p>
      </div>
    );
  }

  const totalAmount = orderDetails?.total ?? 0;

  // --- Payment Handlers ---

  // Cash on Delivery Handler
  const handleCashOnDelivery = async (paymentData) => {
    try {
      const response = await apiConnector(
        PaymentApi.createCODTransaction,
        "POST",
        paymentData,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Order placed successfully! Your COD order is confirmed.");
      navigate("/student/orders");
    } catch (err) {
      toast.error(err.message || "There was a problem with your order.");
    }
  };

  // Payment Verification Handler
  const verifyPayment = async (data) => {
    try {
      const response = await apiConnector(
        PaymentApi.verifyPayment,
        "POST",
        data,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success("Payment Successful! Thank you for your payment!");
        navigate("/student/orders");
      }
    } catch (err) {
      toast.error(
        "Payment Verification Failed. There was a problem verifying your payment."
      );
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Razorpay Handler, pass custom transaction ID in 'notes'
  const openRazorpay = async (paymentData) => {
    await loadRazorpayScript();
    try {
      // Pass custom transaction ID to your backend for order creation
      const response = await apiConnector(
        PaymentApi.createOrder,
        "POST",
        paymentData,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      const OrderData = response.data.data;

      const options = {
        key: OrderData.key,
        amount: OrderData.amount,
        currency: OrderData.currency,
        order_id: OrderData.razorpayOrderId,
        // Include custom transactionId via 'notes'
        notes: {
          orderId: orderId,
        },
        handler: function (response) {
          // Optionally, send the transactionId along with verification
          verifyPayment(response);
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast.error(err.message || "Failed to initiate payment.");
    }
  };

  // Main Payment Button Handler
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (!orderId) throw new Error("Missing order ID.");

      const paymentData = {
        orderId,
        method: paymentMethod,
      };

      if (paymentMethod === "cod") {
        await handleCashOnDelivery(paymentData);
      } else {
        await openRazorpay(paymentData);
      }

      dispatch(clearCart());
      disconnectSocket();
    } catch (error) {
      toast.error(error.message || "Please check your payment details");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Render UI ---

  return (
    <div className="min-h-screen text-gray-50 w-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-300 dark:border-gray-600">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="border border-gray-300 dark:border-gray-600 focus:outline-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Payment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Order Summary */}
        <Card className="mb-6 border-gray-300 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card className="border-gray-300 dark:border-gray-600">
          <CardHeader>
            <CardTitle>Choose Payment Method</CardTitle>
            <CardDescription>
              Select your preferred payment option
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value)}
              className="space-y-4"
            >
              {/* Cash on Delivery */}
              {/* <div className="flex items-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">
                        Pay when your order arrives
                      </div>
                    </div>
                  </div>
                </Label>
              </div> */}
              <div className="flex items-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800">
              <RadioGroupItem value="cod" id="cod" disabled />
              <Label htmlFor="cod" className="flex-1 cursor-not-allowed">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-500">Cash on Delivery</span>
                      <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full">
                        Not Available
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Currently unavailable in your area
                    </div>
                  </div>
                </div>
              </Label>
            </div>

              {/* UPI Payment */}
              <div className="flex items-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">UPI Payment</div>
                      <div className="text-sm text-gray-500">
                        Pay using your UPI ID (VPA)
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base border border-gray-300 dark:border-gray-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {paymentMethod === "cod"
                    ? "Place Order"
                    : `Pay ₹${totalAmount.toFixed(2)}`}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-400">
                <Shield className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Policy Agreement */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            By placing your order, you agree to our{" "}
            <button
              onClick={() => setIsRefundModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Refund Policy
            </button>
          </p>
        </div>
      </div>

      {/* Refund Policy Modal */}
      <RefundPolicyModal
        onOpen={isRefundModalOpen}
        onOpenChange={setIsRefundModalOpen}
      />
    </div>
  );
}
