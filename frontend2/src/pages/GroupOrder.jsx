import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Loader2,
  Trash2,
  Minus,
  Plus,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";

const TransactionRowDesktop = ({ txn, member, isCurrentUser, amount }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const statusText =
    txn.status === "pending"
      ? "Processing..."
      : txn.status.charAt(0).toUpperCase() + txn.status.slice(1);

  const loadingSpinner = txn.status === "pending" ? (
    <Loader2 className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-600 inline" />
  ) : null;

  return (
    <tr>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {isCurrentUser ? "You" : member?.name || "Unknown"}
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
        ₹{amount.toFixed(2)}
      </td>
      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[txn.status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {loadingSpinner}
          {statusText}
        </span>
      </td>
    </tr>
  );
};

const TransactionRowMobile = ({ txn, member, isCurrentUser, amount }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const statusText =
    txn.status === "pending"
      ? "Processing..."
      : txn.status.charAt(0).toUpperCase() + txn.status.slice(1);

  const loadingSpinner = txn.status === "pending" ? (
    <Loader2 className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-600 inline" />
  ) : null;

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="space-y-1">
        <div className="font-medium text-gray-900 dark:text-white">
          {isCurrentUser ? "You" : member?.name || "Unknown"}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(txn.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="flex flex-col items-end space-y-1">
        <div className="font-semibold">₹{amount.toFixed(2)}</div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            statusColors[txn.status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {loadingSpinner}
          {statusText}
        </span>
      </div>
      {txn.transactionId && (
        <div className="col-span-2 mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
          Txn ID: {txn.transactionId}
        </div>
      )}
    </div>
  );
};

export default function GroupOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, User } = useSelector((state) => state.Auth);
  const [groupOrder, setGroupOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [splitType, setSplitType] = useState("equal");
  const [amounts, setAmounts] = useState([]);
  const [payer, setPayer] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState(null);
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const updateTimeout = useRef(null);

  const groupLink = new URLSearchParams(location.search).get("link");

  useEffect(() => {
    if (!groupLink) {
      toast.error("Invalid group link.");
      navigate("/");
    }
  }, [groupLink, navigate]);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay SDK loaded");
      script.onerror = () =>
        toast.error("Razorpay SDK failed to load. Could not load payment gateway script.");
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  useEffect(() => {
    console.log("Auth State:", { token, User });
    if (!token || !User?._id) {
      navigate("/login");
    }
  }, [token, User, navigate]);

  useEffect(() => {
    const fetchGroupOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/${groupLink}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to load group order");
        }
        const data = await res.json();
        console.log("Fetched groupOrder:", data.groupOrder);
        setGroupOrder(data.groupOrder);
        setItems(data.groupOrder.items || []);
        setSplitType(data.groupOrder.paymentDetails.splitType);
        setAmounts(data.groupOrder.paymentDetails.amounts || []);
        setPayer(data.groupOrder.paymentDetails.payer);
      } catch (err) {
        console.error("Error fetching group order:", err);
        toast.error(err.message || "Failed to load group order");
        setGroupOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (groupLink && token) {
      fetchGroupOrder();
    }
  }, [groupLink, token]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!groupOrder?.canteen || !token) return;
      try {
        const res = await fetch(
          `https://cbbackend-kvp6.onrender.com/api/v1/items/getItems/${groupOrder.canteen}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch canteen menu");
        }
        const data = await res.json();
        setMenuItems(data?.data || []);
        if (data.data.length > 0 && !selectedMenuItemId) {
          setSelectedMenuItemId(data.data[0]._id);
        }
      } catch (e) {
        toast.error(e.message || "Failed to fetch canteen menu");
      }
    };
    fetchMenuItems();
  }, [groupOrder?.canteen, token, selectedMenuItemId]);

  const persistItemsToBackend = async (updatedItems) => {
    if (!groupOrder || !token) return;
    setSavingItems(true);
    try {
      const updatePayload = {
        groupOrderId: groupOrder._id,
        items: updatedItems,
      };
      console.log(updatePayload);
      const res = await fetch(
        `https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );
      console.log(res);
      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || "Failed to update group order");
      }
      await fetchGroupOrder();
      toast.success("Items updated successfully");
    } catch (e) {
      toast.error(e.message || "Failed to save items");
    } finally {
      setSavingItems(false);
    }
  };

  const fetchGroupOrder = async () => {
    try {
      const res = await fetch(
        `https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/${groupLink}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to load group order");
      }
      const data = await res.json();
      console.log("Refreshed groupOrder:", data.groupOrder);
      setGroupOrder(data.groupOrder);
      setItems(data.groupOrder.items || []);
      setSplitType(data.groupOrder.paymentDetails.splitType);
      setAmounts(data.groupOrder.paymentDetails.amounts || []);
      setPayer(data.groupOrder.paymentDetails.payer);
    } catch (err) {
      console.error("Error refreshing group order:", err);
      toast.error(err.message || "Failed to load group order");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const updatedItems = items.filter(
        (i) => (typeof i.item === "object" ? i.item._id : i.item) !== itemId
      );
      setItems(updatedItems);
      await persistItemsToBackend(updatedItems);
      toast.success("Item removed from the order");
    } catch (error) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  const updateItemQuantityDebounced = (itemId, quantity) => {
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    updateTimeout.current = setTimeout(() => {
      performUpdateItemQuantity(itemId, quantity);
    }, 500);
  };

  const performUpdateItemQuantity = async (itemId, quantity) => {
    const updated = items.map((i) =>
      i.item && typeof i.item === "object"
        ? i.item._id === itemId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
        : i.item === itemId
        ? { ...i, quantity: Math.max(1, quantity) }
        : i
    );
    setItems(updated);
    await persistItemsToBackend(updated);
  };

  const addItem = async () => {
    if (!selectedMenuItemId || newItemQuantity < 1) {
      toast.error("Please select an item and enter quantity >= 1.");
      return;
    }
    const selectedMenuItem = menuItems.find((mi) => mi._id === selectedMenuItemId);
    if (!selectedMenuItem) {
      toast.error("Selected item not found in menu.");
      return;
    }
    const updatedItems = [...items];
    const existingIndex = updatedItems.findIndex((i) =>
      i.item && typeof i.item === "object"
        ? i.item._id === selectedMenuItemId
        : i.item === selectedMenuItemId
    );
    if (existingIndex !== -1) {
      updatedItems[existingIndex].quantity += newItemQuantity;
      updatedItems[existingIndex].nameAtPurchase = selectedMenuItem.name;
      updatedItems[existingIndex].priceAtPurchase = selectedMenuItem.price;
      updatedItems[existingIndex].item = selectedMenuItem;
    } else {
      updatedItems.push({
        item: selectedMenuItem,
        quantity: newItemQuantity,
        nameAtPurchase: selectedMenuItem.name,
        priceAtPurchase: selectedMenuItem.price,
      });
    }
    setItems(updatedItems);
    setNewItemQuantity(1);
    toast.success("Item added to the order");
    await persistItemsToBackend(updatedItems);
  };

  const updateAmountForUser = (userId, newAmount) => {
    setAmounts((prev) => {
      const existing = prev.find((a) => a.user === userId);
      if (existing) {
        return prev.map((a) =>
          a.user === userId ? { ...a, amount: newAmount } : a
        );
      }
      return [...prev, { user: userId, amount: newAmount }];
    });
  };

  const calculateTotal = () => {
    return items.reduce(
      (acc, i) =>
        acc +
        (i.priceAtPurchase ?? (typeof i.item === "object" ? i.item.price : 0)) *
          i.quantity,
      0
    );
  };

  useEffect(() => {
    if (splitType === "custom" && groupOrder) {
      const currentAmounts =
        amounts.length > 0
          ? amounts
          : groupOrder.members.map((member) => ({
              user: member._id,
              amount: calculateTotal() / groupOrder.members.length,
            }));
      const hasAllMembers = groupOrder.members.every((member) =>
        currentAmounts.find((a) => a.user === member._id)
      );
      if (!hasAllMembers) {
        const completeAmounts = groupOrder.members.map((member) => {
          const existing = currentAmounts.find((a) => a.user === member._id);
          return existing || { user: member._id, amount: calculateTotal() / groupOrder.members.length };
        });
        setAmounts(completeAmounts);
      }
    }
  }, [splitType, groupOrder, amounts, calculateTotal]);

  const updateOrder = async () => {
    if (!groupOrder || !token) return;
    setPaymentProcessing(true);
    try {
      const updatePayload = {
        groupOrderId: groupOrder._id,
        items,
        splitType,
        amounts:
          splitType === "custom"
            ? amounts
            : groupOrder.members.map((m) => ({
                user: m._id,
                amount: calculateTotal() / groupOrder.members.length,
              })),
        payer: payer || groupOrder.creator,
        pickupTime: new Date().toISOString(),
        canteen: groupOrder.canteen,
      };
      const res = await fetch(
        `https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/add-items-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );
      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || "Failed to update group order");
      }
      const data = await res.json();
      setGroupOrder(data.data.groupOrder);
      if (data.data.transactions.length === 0) {
        toast.success("Group order updated but no new transactions created");
        return;
      }
      for (const txn of data.data.transactions) {
        if (txn.userId !== User?._id) continue;
        await openRazorpayCheckout(txn);
      }
      toast.success("Payment initiated. Please complete your payment(s).");
    } catch (e) {
      toast.error(e.message || "Failed to update group order");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const openRazorpayCheckout = (transaction) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded");
        return reject(new Error("Razorpay SDK not loaded"));
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_bnxn34fZ9ODg4f",
        amount: Math.round(transaction.amount * 100),
        currency: "INR",
        name: "Campus Bites",
        description: "Group Order Payment",
        order_id: transaction.razorpayOrderId,
        handler: async function (response) {
          try {
            const res = await fetch(
              `https://cbbackend-kvp6.onrender.com/api/v1/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  transactionId: transaction.transactionId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              }
            );
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "Payment verification failed");
            }
            toast.success("Payment successful! Thank you!");
            navigate("/thank-you");
            resolve();
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
            reject(err);
          }
        },
        prefill: { name: User?.name, email: User?.email },
        theme: { color: "#F44336" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            reject(new Error("Payment cancelled"));
          },
        },
      };
      new window.Razorpay(options).open();
    });

  const handleJoinGroup = async () => {
    try {
      if (!token) throw new Error("Not authenticated");
      if (groupOrder && groupOrder.members.some((m) => m._id === User?._id)) {
        toast.success("Already a member");
        return;
      }
      const res = await fetch(
        `https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ link: groupLink }),
        }
      );
      if (!res.ok) {
        const errResp = await res.json();
        throw new Error(errResp.message || "Failed to join group");
      }
      toast.success("Joined group successfully");
      await fetchGroupOrder();
    } catch (e) {
      toast.error(e.message || "Failed to join group");
    }
  };

  const userIsMember = groupOrder?.members?.some((m) => m._id === User?._id) || false;
  console.log("userIsMember:", userIsMember, "User._id:", User?._id, "Members:", groupOrder?.members);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center gap-3 text-white text-xl">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading group order details...
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
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-950 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
          Group Order
        </h1>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="px-3 py-1 text-xs sm:text-sm rounded-full bg-red-900/30 text-red-300">
            {groupOrder.status}
          </span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="mx-auto sm:mx-0">
            <img
              src={groupOrder.qrCodeUrl}
              alt="Group QR Code"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded"
            />
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
              <h2 className="text-sm font-medium text-gray-400">Status</h2>
              <p className="text-sm font-medium">{groupOrder.status}</p>
            </div>
          </div>
        </div>
      </div>

      {!userIsMember && (
        <div className="text-center py-8 bg-gray-800 rounded-lg shadow-sm p-6 max-w-2xl mx-auto border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-3">
            Join this Group Order
          </h2>
          <p className="text-gray-300 mb-6">
            You've been invited to join this group order. Click the button below to participate and start adding items.
          </p>
          <button
            onClick={handleJoinGroup}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-full text-base transition-all duration-300 transform hover:scale-105"
          >
            Join Group Order
          </button>
        </div>
      )}
      {userIsMember && (
        <>
          <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            <div className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Add Item to Your Share
              </h3>
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
                  placeholder="Qty"
                />
                <button
                  onClick={addItem}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={savingItems || !selectedMenuItemId}
                >
                  {savingItems ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" />
                      Adding...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            <div className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Your Order Items
                <span className="ml-2 px-2.5 py-0.5 text-sm font-medium bg-gray-700 text-gray-300 rounded-full">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </h3>
            </div>
            <div className="p-4 sm:p-5">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-white">
                    No items added
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Start by adding items from the menu above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => {
                    let displayName = "Unknown item";
                    let displayPrice = 0;
                    if (typeof item.item === "object" && item.item !== null) {
                      displayName = item.item.name;
                      displayPrice = item.item.price;
                    } else if (item.nameAtPurchase) {
                      displayName = item.nameAtPurchase;
                      displayPrice = item.priceAtPurchase ?? 0;
                    }
                    const totalPrice = displayPrice * item.quantity;
                    return (
                      <div
                        key={item._id || idx}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{displayName}</h4>
                          <p className="text-sm text-gray-400">
                            ₹{displayPrice.toFixed(2)} × {item.quantity} = ₹
                            {totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min={1}
                            className="w-20 text-center py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 disabled:opacity-50"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantityDebounced(
                                typeof item.item === "object" ? item.item._id : item.item,
                                Math.max(1, +e.target.value)
                              )
                            }
                            disabled={savingItems}
                          />
                          <button
                            className="text-red-600 hover:bg-red-900/20 p-2 rounded-full disabled:opacity-50"
                            onClick={() =>
                              removeItem(typeof item.item === "object" ? item.item._id : item.item)
                            }
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

          <div className="mb-8 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            <div className="p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-white">Payment Split</h3>
              <p className="text-sm text-gray-400">
                Choose how to split the total amount among group members.
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={splitType === "equal"}
                      onChange={() => setSplitType("equal")}
                      name="splitType"
                      disabled={savingItems}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-700"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-300">Equal split</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={splitType === "custom"}
                      onChange={() => setSplitType("custom")}
                      name="splitType"
                      disabled={savingItems}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-700"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-300">Custom split</span>
                  </label>
                </div>
                {splitType === "custom" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-400 flex-1">
                        <span>Member</span>
                        <span className="text-center">Amount (₹)</span>
                        <span className="text-right">Share</span>
                      </div>
                      <button
                        onClick={() => {
                          const equalAmount = calculateTotal() / groupOrder.members.length;
                          const equalAmounts = groupOrder.members.map((member) => ({
                            user: member._id,
                            amount: equalAmount,
                          }));
                          setAmounts(equalAmounts);
                        }}
                        disabled={savingItems}
                        className="ml-4 text-xs px-3 py-1 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                      >
                        Split Equally
                      </button>
                    </div>
                    {groupOrder.members.map((member) => {
                      const userAmount = amounts.find((a) => a.user === member._id) || {
                        user: member._id,
                        amount: 0,
                      };
                      const total = calculateTotal();
                      const percentage = total > 0 ? (userAmount.amount / total) * 100 : 0;
                      return (
                        <div key={member._id} className="grid grid-cols-3 gap-4 items-center">
                          <span className="font-medium text-white">
                            {member._id === User?._id ? "You" : member.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() =>
                                updateAmountForUser(member._id, Math.max(0, userAmount.amount - 10))
                              }
                              disabled={savingItems || userAmount.amount <= 0}
                              className="h-8 w-8 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                            >
                              <Minus className="h-3 w-3 mx-auto" />
                            </button>
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                ₹
                              </span>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={userAmount.amount}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  updateAmountForUser(member._id, isNaN(value) ? 0 : Math.max(0, value));
                                }}
                                disabled={savingItems}
                                className="pl-8 text-center text-sm h-8 border border-gray-600 rounded-lg bg-gray-700 text-gray-100"
                                placeholder="0.00"
                              />
                            </div>
                            <button
                              onClick={() => updateAmountForUser(member._id, userAmount.amount + 10)}
                              disabled={savingItems}
                              className="h-8 w-8 rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                            >
                              <Plus className="h-3 w-3 mx-auto" />
                            </button>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-gray-400">{percentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Assigned Total</span>
                        <span
                          className={`font-semibold ${
                            Math.abs(amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()) < 0.01
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          ₹{amounts.reduce((sum, a) => sum + a.amount, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-medium">Order Total</span>
                        <span className="font-semibold text-white">
                          ₹{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      {Math.abs(amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()) >= 0.01 && (
                        <div className="mt-2 p-2 bg-red-900/20 rounded-lg border border-red-800">
                          <p className="text-sm text-red-400 font-medium">
                            ⚠️ Total mismatch: ₹
                            {(amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()).toFixed(2)}
                          </p>
                          <p className="text-xs text-red-400 mt-1">
                            The assigned amounts must equal the order total to proceed with payment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            <div className="p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-white">Select Payer</h3>
              <p className="text-sm text-gray-400">
                Choose who will make the payment for this order.
              </p>
            </div>
            <div className="p-4 sm:p-5">
              <div className="space-y-3">
                {groupOrder.members.map((member) => (
                  <div
                    key={member._id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      payer === member._id
                        ? "border-red-500 bg-red-900/20"
                        : "border-gray-700 hover:bg-gray-800/50"
                    }`}
                    onClick={() => setPayer(member._id)}
                  >
                    <div
                      className={`flex items-center justify-center h-5 w-5 rounded-full border ${
                        payer === member._id ? "border-red-500 bg-red-500" : "border-gray-600"
                      }`}
                    >
                      {payer === member._id && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="ml-3 block text-sm font-medium text-white">
                      {member._id === User?._id ? "You" : member.name}
                    </span>
                    {member._id === User?._id && (
                      <span className="ml-auto px-2.5 py-0.5 text-xs font-medium bg-green-900/30 text-green-300 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 left-0 right-0 bg-gray-900 pt-3 sm:pt-4 pb-4 sm:pb-6 border-t border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {(() => {
                const isCustomSplitValid =
                  splitType === "equal" ||
                  Math.abs(amounts.reduce((sum, a) => sum + a.amount, 0) - calculateTotal()) < 0.01;
                return (
                  <>
                    <button
                      disabled={paymentProcessing || savingItems || items.length === 0 || !isCustomSplitValid}
                      onClick={updateOrder}
                      className={`w-full py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 ${
                        isCustomSplitValid
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {paymentProcessing ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white inline" />
                          Processing...
                        </>
                      ) : !isCustomSplitValid ? (
                        "Fix Split Amounts to Continue"
                      ) : (
                        `Pay ₹${calculateTotal().toFixed(2)}`
                      )}
                    </button>
                    <p className="mt-2 text-center text-xs text-gray-400">
                      {!isCustomSplitValid
                        ? "Custom split amounts must equal the order total"
                        : "You'll complete the payment in the next step"}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

          {groupOrder.paymentDetails.transactions.length > 0 && (
            <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Transaction History
                </h3>
              </div>
              <div className="p-0 sm:p-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="hidden sm:block">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {groupOrder.paymentDetails.transactions.map((txn) => (
                          <TransactionRowDesktop
                            key={txn.transactionId}
                            txn={txn}
                            member={groupOrder.members.find((m) => m._id === txn.user)}
                            isCurrentUser={
                              groupOrder.members.find((m) => m._id === txn.user)?._id === User?._id
                            }
                            amount={amounts.find((a) => a.user === txn.user)?.amount || 0}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="sm:hidden space-y-3 p-4">
                    {groupOrder.paymentDetails.transactions.map((txn) => (
                      <div
                        key={txn.transactionId}
                        className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700"
                      >
                        <TransactionRowMobile
                          txn={txn}
                          member={groupOrder.members.find((m) => m._id === txn.user)}
                          isCurrentUser={
                            groupOrder.members.find((m) => m._id === txn.user)?._id === User?._id
                          }
                          amount={amounts.find((a) => a.user === txn.user)?.amount || 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
