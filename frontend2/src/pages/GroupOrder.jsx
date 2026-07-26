import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader2, Trash2, ShoppingCart, CheckCircle, Lock } from "lucide-react";

const API_BASE = "http://localhost:8080/api/v1";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const ParticipantRow = ({ participant, isYou }) => (
  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
    <div>
      <p className="font-medium text-white">{isYou ? "You" : participant.user?.name || "Unknown"}</p>
      <p className="text-xs text-gray-400">
        {participant.items?.length || 0} item{participant.items?.length === 1 ? "" : "s"}
      </p>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-300">₹{(participant.amount || 0).toFixed(2)}</span>
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusColors[participant.paymentStatus] || statusColors.pending
        }`}
      >
        {participant.paymentStatus === "paid" ? "Paid" : participant.paymentStatus === "failed" ? "Failed" : "Pending"}
      </span>
    </div>
  </div>
);

export default function GroupOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, User } = useSelector((state) => state.Auth);

  const [groupOrder, setGroupOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myItems, setMyItems] = useState([]);
  const [savingItems, setSavingItems] = useState(false);
  const [paying, setPaying] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState(null);
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState("");

  const updateTimeout = useRef(null);
  const groupLink = new URLSearchParams(location.search).get("link");

  useEffect(() => {
    if (!groupLink) {
      toast.error("Invalid group link.");
      navigate("/");
    }
  }, [groupLink, navigate]);

  useEffect(() => {
    if (!token || !User?._id) navigate("/login");
  }, [token, User, navigate]);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onerror = () => toast.error("Payment gateway failed to load.");
      document.body.appendChild(script);
    }
  }, []);

  const fetchGroupOrder = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/groupOrder/${groupLink}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to load group order");
      }
      const data = await res.json();
      setGroupOrder(data.groupOrder);
      const mine = data.groupOrder.participants?.find((p) => p.user?._id === User?._id);
      setMyItems(mine?.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load group order");
      setGroupOrder(null);
    } finally {
      setLoading(false);
    }
  }, [groupLink, token, User]);

  useEffect(() => {
    if (groupLink && token) fetchGroupOrder();
  }, [groupLink, token, fetchGroupOrder]);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!groupOrder?.canteen || !token) return;
      try {
        const res = await fetch(`${API_BASE}/items/getItems/${groupOrder.canteen}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch canteen menu");
        const data = await res.json();
        setMenuItems(data?.data || []);
        if (data.data?.length > 0 && !selectedMenuItemId) setSelectedMenuItemId(data.data[0]._id);
      } catch (e) {
        toast.error(e.message);
      }
    };
    fetchMenu();
  }, [groupOrder?.canteen, token, selectedMenuItemId]);

  const myParticipant = groupOrder?.participants?.find((p) => p.user?._id === User?._id);
  const hasPaid = myParticipant?.paymentStatus === "paid";
  const isLocked = groupOrder && groupOrder.status !== "open";
  const isCreator = groupOrder?.creator?._id === User?._id;
  const isVendor = !!User?.isVendor;

  const calculateMyTotal = () =>
    myItems.reduce((acc, i) => {
      const price = i.priceAtPurchase ?? (typeof i.item === "object" ? i.item?.price : 0) ?? 0;
      return acc + price * i.quantity;
    }, 0);

  const persistMyItems = async (updatedItems) => {
    if (!groupOrder || !token) return;
    setSavingItems(true);
    try {
      const payload = {
        groupOrderId: groupOrder._id,
        items: updatedItems.map((i) => ({
          item: typeof i.item === "object" ? i.item._id : i.item,
          quantity: i.quantity,
        })),
      };
      const res = await fetch(`${API_BASE}/groupOrder/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update items");
      }
      await fetchGroupOrder();
    } catch (e) {
      toast.error(e.message || "Failed to save items");
    } finally {
      setSavingItems(false);
    }
  };

  const addItem = async () => {
    if (!selectedMenuItemId || newItemQuantity < 1) {
      toast.error("Select an item and a quantity of at least 1.");
      return;
    }
    const menuItem = menuItems.find((mi) => mi._id === selectedMenuItemId);
    if (!menuItem) return;

    const updated = [...myItems];
    const idx = updated.findIndex((i) => (typeof i.item === "object" ? i.item._id : i.item) === selectedMenuItemId);
    if (idx !== -1) {
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + newItemQuantity, item: menuItem };
    } else {
      updated.push({ item: menuItem, quantity: newItemQuantity });
    }
    setMyItems(updated);
    setNewItemQuantity(1);
    await persistMyItems(updated);
    toast.success("Item added");
  };

  const removeItem = async (itemId) => {
    const updated = myItems.filter((i) => (typeof i.item === "object" ? i.item._id : i.item) !== itemId);
    setMyItems(updated);
    await persistMyItems(updated);
    toast.success("Item removed");
  };

  const updateQuantityDebounced = (itemId, quantity) => {
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    const updated = myItems.map((i) =>
      (typeof i.item === "object" ? i.item._id : i.item) === itemId ? { ...i, quantity: Math.max(1, quantity) } : i
    );
    setMyItems(updated);
    updateTimeout.current = setTimeout(() => persistMyItems(updated), 500);
  };

  const payForMyItems = async () => {
    if (!groupOrder || !token || myItems.length === 0) return;
    setPaying(true);
    try {
      const res = await fetch(`${API_BASE}/groupOrder/pay/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupOrderId: groupOrder._id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to start payment");
      }
      const { data } = await res.json();

      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");

      await new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_bnxn34fZ9ODg4f",
          amount: Math.round(data.amount * 100),
          currency: "INR",
          name: "Campus Bites",
          description: "Group Order - Your Share",
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${API_BASE}/groupOrder/pay/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  groupOrderId: groupOrder._id,
                  transactionId: data.transactionId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              if (!verifyRes.ok) {
                const err = await verifyRes.json();
                throw new Error(err.message || "Payment verification failed");
              }
              toast.success("Payment successful, you're in the group!");
              await fetchGroupOrder();
              resolve();
            } catch (err) {
              toast.error(err.message);
              reject(err);
            }
          },
          prefill: { name: User?.name, email: User?.email },
          theme: { color: "#F44336" },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        };
        new window.Razorpay(options).open();
      });
    } catch (e) {
      toast.error(e.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const finalizeOrder = async () => {
    if (!groupOrder || !token) return;
    setFinalizing(true);
    try {
      const res = await fetch(`${API_BASE}/groupOrder/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupOrderId: groupOrder._id, pickupTime: pickupTime || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create order");
      }
      toast.success("Order sent to the canteen!");
      await fetchGroupOrder();
    } catch (e) {
      toast.error(e.message || "Failed to create order");
    } finally {
      setFinalizing(false);
    }
  };

  const updateVendorStatus = async (status) => {
    try {
      const res = await fetch(`${API_BASE}/groupOrder/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupOrderId: groupOrder._id, status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update status");
      }
      toast.success(`Status updated to ${status}`);
      await fetchGroupOrder();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center gap-3 text-white text-xl">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading group order details...
        </div>
      </div>
    );
  }

  if (!groupOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Group Order Not Found</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const paidParticipants = groupOrder.participants?.filter((p) => p.paymentStatus === "paid") || [];

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-950 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          Group Order
        </h1>
        <span className="px-3 py-1 text-xs sm:text-sm rounded-full bg-red-900/30 text-red-300 flex items-center gap-1 capitalize">
          {isLocked && <Lock className="h-3 w-3" />} {groupOrder.status}
        </span>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="mx-auto sm:mx-0">
            <img src={groupOrder.qrCodeUrl} alt="Group QR Code" className="w-24 h-24 sm:w-32 sm:h-32 rounded" />
            <p className="mt-2 break-all text-xs sm:text-sm text-center sm:text-left text-gray-400">
              Group Link: <span className="font-mono">{groupOrder.groupLink}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <div className="bg-gray-700 p-3 rounded-lg">
              <h2 className="text-sm font-medium text-gray-400">Canteen</h2>
              <p className="text-sm font-medium break-words">{groupOrder.canteen}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <h2 className="text-sm font-medium text-gray-400">Paid so far</h2>
              <p className="text-sm font-medium">
                {paidParticipants.length} {paidParticipants.length === 1 ? "person" : "people"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLocked ? (
        <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-white mb-2">Order placed with the canteen</h3>
          {groupOrder.finalOrder?.pickupTime && (
            <p className="text-sm text-gray-400 mb-3">
              Pickup time: {new Date(groupOrder.finalOrder.pickupTime).toLocaleString()}
            </p>
          )}
          <p className="text-sm text-gray-400 mb-4">Total: ₹{(groupOrder.totalAmount || 0).toFixed(2)}</p>

          {isVendor && groupOrder.status !== "completed" && groupOrder.status !== "cancelled" && (
            <div className="flex flex-wrap gap-2">
              {["preparing", "ready", "completed", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateVendorStatus(s)}
                  className="px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700 capitalize"
                >
                  Mark {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {!hasPaid && (
            <>
              <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Add Item to Your Share</h3>
                  <p className="text-sm text-gray-400 mt-1">Add whatever you want, then pay for it to join the group.</p>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-700 text-gray-100 disabled:opacity-50"
                      value={selectedMenuItemId || ""}
                      onChange={(e) => setSelectedMenuItemId(e.target.value)}
                      disabled={savingItems}
                    >
                      <option value="">Select an item</option>
                      {menuItems.map((mi) => (
                        <option key={mi._id} value={mi._id}>
                          {mi.name} - ₹{mi.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className="w-full sm:w-20 text-center py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 disabled:opacity-50"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(Math.max(1, +e.target.value))}
                      disabled={savingItems}
                    />
                    <button
                      onClick={addItem}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-500"
                      disabled={savingItems || !selectedMenuItemId}
                    >
                      {savingItems ? <Loader2 className="animate-spin h-4 w-4 inline" /> : "Add Item"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Your Items
                    <span className="ml-2 px-2.5 py-0.5 text-sm font-medium bg-gray-700 text-gray-300 rounded-full">
                      {myItems.length}
                    </span>
                  </h3>
                </div>
                <div className="p-4 sm:p-5">
                  {myItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-white">No items yet</h3>
                      <p className="mt-1 text-sm text-gray-400">Add something above to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myItems.map((i, idx) => {
                        const name = typeof i.item === "object" ? i.item.name : i.nameAtPurchase;
                        const price = typeof i.item === "object" ? i.item.price : i.priceAtPurchase ?? 0;
                        const id = typeof i.item === "object" ? i.item._id : i.item;
                        return (
                          <div key={id || idx} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{name}</h4>
                              <p className="text-sm text-gray-400">
                                ₹{price.toFixed(2)} × {i.quantity} = ₹{(price * i.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min={1}
                                className="w-20 text-center py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 disabled:opacity-50"
                                value={i.quantity}
                                onChange={(e) => updateQuantityDebounced(id, Math.max(1, +e.target.value))}
                                disabled={savingItems}
                              />
                              <button
                                className="text-red-600 hover:bg-red-900/20 p-2 rounded-full disabled:opacity-50"
                                onClick={() => removeItem(id)}
                                disabled={savingItems}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 bg-gray-900 pt-3 sm:pt-4 pb-4 sm:pb-6 border-t border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                  <button
                    disabled={paying || savingItems || myItems.length === 0}
                    onClick={payForMyItems}
                    className="w-full py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-lg shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 inline" /> Processing...
                      </>
                    ) : (
                      `Pay ₹${calculateMyTotal().toFixed(2)} to Join`
                    )}
                  </button>
                  <p className="mt-2 text-center text-xs text-gray-400">
                    You'll be added to the group as soon as your payment goes through.
                  </p>
                </div>
              </div>
            </>
          )}

          {hasPaid && (
            <div className="mb-6 bg-gray-800 rounded-lg border border-green-800 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">You're in! Payment confirmed.</h3>
              </div>
              <div className="space-y-2">
                {myItems.map((i, idx) => {
                  const name = typeof i.item === "object" ? i.item.name : i.nameAtPurchase;
                  const price = typeof i.item === "object" ? i.item.price : i.priceAtPurchase ?? 0;
                  return (
                    <div key={idx} className="flex justify-between text-sm text-gray-300">
                      <span>
                        {name} × {i.quantity}
                      </span>
                      <span>₹{(price * i.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-gray-400">Your items are locked in and can't be changed anymore.</p>
            </div>
          )}

          <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            <div className="p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-white">Who's In</h3>
              <p className="text-sm text-gray-400">Only people who've paid are counted in the group.</p>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {paidParticipants.length === 0 ? (
                <p className="text-sm text-gray-400">No one has paid yet.</p>
              ) : (
                paidParticipants.map((p) => (
                  <ParticipantRow key={p.user?._id || p._id} participant={p} isYou={p.user?._id === User?._id} />
                ))
              )}
            </div>
          </div>

          {isCreator && (
            <div className="mb-8 bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Finalize &amp; Send to Canteen</h3>
              <p className="text-sm text-gray-400 mb-4">
                This combines everyone's paid items into one order and locks the group — no more joining or edits after this.
              </p>
              <input
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full mb-3 px-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-700 text-gray-100"
              />
              <button
                onClick={finalizeOrder}
                disabled={finalizing || !hasPaid || paidParticipants.length === 0}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {finalizing ? "Creating Order..." : "Create Order"}
              </button>
              {!hasPaid && (
                <p className="mt-2 text-xs text-red-400">You need to add your own items and pay before finalizing.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}