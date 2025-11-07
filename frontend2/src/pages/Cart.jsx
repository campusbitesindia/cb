import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../component/ui/button";
import { Input } from "../component/ui/input";
import { Textarea } from "../component/ui/textarea";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  MapPin,
  Clock,
  Gift,
  Loader2,
  StickyNote,
} from "lucide-react";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  incrementQuantity,
  decrementQuantity,
} from "../slices/CartSlice";
import { OrderApi, OfferApi } from "../services/api";
import apiConnector from "../services/apiConnector";
import toast from "react-hot-toast";
import { useSocket } from "../context/Socket";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import CartTimePicker from "../component/CartTimePicker";

function CartPageContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart } = useSelector((state) => state.Cart);
  const { user, token } = useSelector((state) => state.Auth);

  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [isOfferPickerOpen, setIsOfferPickerOpen] = useState(false);
  const { isConnected, connectSocket, getSocket } = useSocket();
  // Minimum selectable time = current time + 11 minutes
  const minAllowedTime = dayjs().add(11, "minute");
  const [time, setTime] = useState(minAllowedTime);

  // Calculate total price from cart
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Derive selected offer and compute preview discount (mirrors backend logic)
  const selectedOffer = useMemo(
    () => offers.find((o) => o._id === selectedOfferId),
    [offers, selectedOfferId]
  );

  const offerDiscount = useMemo(() => {
    if (!selectedOffer) return 0;

    const total = Number(totalPrice || 0);
    const minValue = Number(selectedOffer.MinValue || 0);
    const maxValue = Number(selectedOffer.MaxValue || 0);
    const maxDiscount = Number(selectedOffer.MaxDiscount || 0);
    const pct = Number(selectedOffer.discount || 0); // e.g. 10 for 10%

    // Enforce minimum order value
    if (total < minValue) return 0;

    // Calculate dynamic minimum discount (based on MinValue)
    const minPossibleDiscount = (minValue * pct) / 100;

    // If total ≥ MaxValue → apply flat MaxDiscount
    if (maxValue && total >= maxValue) {
      return Math.min(maxDiscount, total);
    }

    // Percentage discount
    const percDisc = (total * pct) / 100;

    // Apply limits: between minPossibleDiscount and maxDiscount
    const finalDiscount = Math.min(
      Math.max(percDisc, minPossibleDiscount),
      maxDiscount
    );

    return Math.max(0, finalDiscount);
  }, [selectedOffer, totalPrice]);

  // Quantity and removal handlers
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
    toast.success("Item removed from cart");
  };

  const handleApplyPromo = () => {
    setIsApplyingPromo(true);
    setTimeout(() => {
      if (promoCode.toLowerCase() === "welcome10") {
        const discountAmount = totalPrice * 0.1;
        setDiscount(discountAmount);
        toast.success("10% discount applied to your order!");
      } else {
        toast.error("Invalid promo code or expired");
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleCheckout = async () => {
    setIsPlacingOrder(true);
    try {
      if (cart.length === 0) {
        throw new Error("Cart is empty");
      }

      // Check canteen consistency
      const canteenIds = cart.map((item) => item.canteen);
      console.log(canteenIds);
      const canteenId = canteenIds[0];
      if (!isConnected) {
        connectSocket();
        const socket = getSocket();
        socket?.emit("Join_Room", canteenId);
      }
      canteenIds.forEach((id) => {
        if (id !== canteenId) {
          throw new Error("Items from different canteens are not allowed");
        }
      });

      if (!time) {
        throw new Error("Please select a pickup time");
      }

      // Validate pickup time is at least 10 minutes from now
      const selectedPickupTime = new Date(time);
      if (selectedPickupTime.getTime() - Date.now() < 10 * 60 * 1000) {
        throw new Error("Pickup time must be at least 10 minutes from now");
      }

      // Prepare backend data
      const items = JSON.stringify(cart);
      const orderData = {
        items,
        pickUpTime: selectedPickupTime.toISOString(),
        canteenId,
        note: note.trim(),
        promoCode: promoCode || null,
        // Only promo code discount is sent explicitly; offer is recalculated on backend
        discount: discount,
        offer: selectedOfferId || undefined,
      };

      console.log("Order Data:", orderData);

      const response = await apiConnector(
        OrderApi.CreateOrder || "/order/CreateOrder",
        "POST",
        orderData,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success("Order created successfully!");
        navigate(`/payment?orderId=${response.data.data._id}`);
      } else {
        throw new Error(response.data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "There was a problem with your cart. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Fetch active offers only when cart has items
  useEffect(() => {
    if (!cart.length) {
      setSelectedOfferId(null);
      return;
    }
    const fetchOffers = async () => {
      setOffersLoading(true);
      try {
        const res = await apiConnector(OfferApi.getActiveOffer, "GET", null, {
          "Content-Type": "application/json",
        });
        if (res.data.success && Array.isArray(res.data.data)) {
          setOffers(res.data.data);
        } else {
          setOffers([]);
        }
      } catch (e) {
        setOffers([]);
      } finally {
        setOffersLoading(false);
      }
    };
    fetchOffers();
  }, [cart.length]);

  if (cart.length === 0) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: "#0b1120" }}
      >
        {/* Header */}
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Your Cart</h1>
          </div>
        </div>

        <div className="px-4 py-16 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button
              onClick={() => navigate("/student/dashboard")}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
            >
              Browse Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#0b1120" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/30">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Your Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div
              className="rounded-lg shadow-lg"
              style={{ backgroundColor: "#10182e" }}
            >
              <div className="p-3 border-b border-gray-700/50 flex justify-between items-center">
                <h2 className="font-semibold text-white">
                  Your Items ({cart.length})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 text-xs"
                  style={{
                    backgroundColor: "#10182e",
                    borderColor: "#E5524A",
                    color: "#E5524A",
                  }}
                  onClick={() => navigate("/student/dashboard")}
                  title="Add more items"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add more</span>
                </Button>
              </div>
              <div className="divide-y divide-gray-700/50">
                {cart.map((item) => (
                  <div key={item._id} className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-700/50 relative">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400">
                              ₹{item.price} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <p className="font-semibold text-white text-sm">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50/10 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center rounded-md border"
                            style={{
                              backgroundColor: "#34383D",
                              borderColor: "#4A4F56",
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-white hover:bg-gray-600 rounded-l-md"
                              style={{ backgroundColor: "#34383D" }}
                              onClick={() =>
                                dispatch(decrementQuantity(item._id))
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span
                              className="px-2 py-1 text-xs font-medium text-white"
                              style={{ backgroundColor: "#34383D" }}
                            >
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-white hover:bg-gray-600 rounded-r-md"
                              style={{ backgroundColor: "#34383D" }}
                              onClick={() =>
                                dispatch(incrementQuantity(item._id))
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code and Note Section */}
            <div
              className="rounded-lg mt-3 p-3 shadow-lg"
              style={{ backgroundColor: "#10182e" }}
            >
              {/* Add a Note for the Canteen Section */}
              <div className="mb-3">
                <label
                  htmlFor="canteen-note"
                  className="flex items-center space-x-2 font-medium text-white mb-1 text-sm"
                >
                  <StickyNote
                    className="h-4 w-4"
                    style={{ color: "#E5524A" }}
                  />
                  <span>Add a note for the canteen</span>
                </label>
                <Textarea
                  id="canteen-note"
                  placeholder="E.g. Please make it less spicy, no onions, etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none min-h-[50px] placeholder:text-gray-500 text-sm"
                  style={{
                    backgroundColor: "#0b1120",
                    borderColor: "#34383D",
                    color: "white",
                  }}
                  maxLength={200}
                />
                <div className="text-xs text-gray-400 text-right mt-1">
                  {note.length}/200
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="h-4 w-4" style={{ color: "#E5524A" }} />
                <span className="font-medium text-white text-sm">
                  Apply Promo Code
                </span>
              </div>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 placeholder:text-gray-500 text-sm"
                  style={{
                    backgroundColor: "#0b1120",
                    borderColor: "#34383D",
                    color: "white",
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo || !promoCode}
                  className="border-red-500 text-red-500 hover:bg-red-50/10 text-xs"
                  style={{
                    backgroundColor: "#10182e",
                    borderColor: "#E5524A",
                    color: "#E5524A",
                  }}
                >
                  {isApplyingPromo ? "Applying..." : "Apply"}
                </Button>
              </div>
              {/* View all coupons CTA (below promo code) */}
              {offers.length > 0 && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-50/10 text-xs"
                    style={{
                      backgroundColor: "#10182e",
                      borderColor: "#E5524A",
                      color: "#E5524A",
                    }}
                    onClick={() => setIsOfferPickerOpen(true)}
                  >
                    View all coupons
                  </Button>
                  {selectedOffer && (
                    <button
                      onClick={() => setSelectedOfferId(null)}
                      className="ml-3 text-[11px] text-red-400 hover:text-red-300"
                    >
                      Remove selected
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 space-y-4">
            {/* Pickup Time Input */}
            {/* <div
              className="rounded-lg p-3 shadow-lg"
              style={{ backgroundColor: "#10182e" }}
            >
              <label
                htmlFor="pickupTime"
                className="block mb-2 font-semibold text-white text-sm"
              >
                Select Pickup Time
              </label>
              <Input
                id="pickupTime"
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full text-white text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-datetime-edit]:text-white/80 [&::-webkit-datetime-edit-fields-wrapper]:text-white/80 [&::-webkit-datetime-edit-text]:text-white/80"
                style={{
                  backgroundColor: "#34383D",
                  borderColor: "#4A4F56",
                  color: "white",
                }}
              />
              <p className="mt-1 text-xs text-gray-400">
                Pickup time must be at least 10 minutes from now.
              </p>
            </div> */}
            <CartTimePicker
              time={time}
              setTime={setTime}
              minAllowedTime={minAllowedTime}
            />

            {/* Bill Details */}
            <div
              className="rounded-lg p-3 shadow-lg sticky top-4"
              style={{ backgroundColor: "#10182e" }}
            >
              <h2 className="font-semibold text-white mb-3 text-sm">
                Bill Details
              </h2>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Item Total</span>
                  <span className="text-white">₹{totalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400">
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedOfferId && (
                  <>
                    {offerDiscount > 0 ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Offer Discount</span>
                        <span className="text-green-400">
                          -₹{offerDiscount.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">
                          Offer selected but not eligible (Min ₹
                          {selectedOffer?.MinValue})
                        </span>
                        <span className="text-gray-500">-₹0.00</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Delivery Fee</span>
                  <span className="text-white">₹0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Taxes & Charges</span>
                  <span className="text-white">₹0</span>
                </div>
              </div>

              <div className="border-t border-gray-700/50 mt-3 pt-3">
                <div className="flex justify-between font-bold text-base">
                  <span className="text-white">To Pay</span>
                  <span className="text-white">
                    ₹{(totalPrice - discount - offerDiscount).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full mt-4 text-white font-bold py-2.5 text-sm rounded-lg"
                style={{ backgroundColor: "#E5524A" }}
                onClick={handleCheckout}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Proceeding...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

              <div className="mt-2 text-center">
                <button
                  onClick={() => navigate("/menu")}
                  className="text-xs hover:text-red-400"
                  style={{ color: "#E5524A" }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Picker Overlay */}
      {isOfferPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOfferPickerOpen(false)}
          />
          <div
            className="relative w-full sm:max-w-lg sm:rounded-xl sm:shadow-2xl border border-gray-700/40"
            style={{ backgroundColor: "#0b1120" }}
          >
            <div className="p-3 border-b border-gray-700/40 flex items-center justify-between">
              <div className="text-white font-semibold text-sm">
                Available Coupons
              </div>
              <button
                onClick={() => setIsOfferPickerOpen(false)}
                className="text-xs text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
              {offersLoading ? (
                <p className="text-xs text-gray-400">Loading offers...</p>
              ) : offers.length === 0 ? (
                <p className="text-xs text-gray-500">No active offers</p>
              ) : (
                offers.map((o) => {
                  const eligible = totalPrice >= (o.MinValue || 0);
                  const isSelected = selectedOfferId === o._id;
                  return (
                    <div
                      key={o._id}
                      className={`flex items-start justify-between p-2 rounded-md border text-xs ${
                        isSelected
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-700/50"
                      }`}
                      style={{ backgroundColor: "#10182e" }}
                    >
                      <div className="pr-2">
                        <p className="text-white font-medium">
                          {o.description}
                        </p>
                        <p className="text-gray-400 mt-0.5">
                          Min ₹{o.MinValue} • Up to ₹{o.MaxDiscount}
                        </p>
                        <p className="text-gray-500 mt-0.5">
                          {Math.round((o.discount || 0) * 100)}% off
                        </p>
                        {!eligible && (
                          <p className="text-[11px] text-amber-300 mt-0.5">
                            Add items worth ₹
                            {Math.max(
                              0,
                              (o.MinValue || 0) - totalPrice
                            ).toFixed(0)}{" "}
                            to use this coupon
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-green-500 text-green-500"
                            style={{ backgroundColor: "#10182e" }}
                            onClick={() => {
                              setIsOfferPickerOpen(false);
                            }}
                          >
                            Selected
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!eligible}
                            className={`text-xs ${
                              eligible
                                ? "border-red-500 text-red-500"
                                : "border-gray-600 text-gray-500"
                            }`}
                            style={{ backgroundColor: "#10182e" }}
                            onClick={() => {
                              setSelectedOfferId(o._id);
                              setIsOfferPickerOpen(false);
                            }}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Cart() {
  return <CartPageContent />;
}
