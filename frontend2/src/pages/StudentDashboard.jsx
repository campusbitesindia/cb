import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Star,
  Clock,
  MapPin,
  Filter,
  Heart,
  Users,
  Copy,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { GetAllCanteens } from "../services/operations/Canteens";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdvertisementBanner from "../component/common/AdvertisementBanner";
const categories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "indian", name: "Indian", icon: "🍛" },
  { id: "italian", name: "Italian", icon: "🍕" },
  { id: "healthy", name: "Healthy", icon: "🥗" },
  { id: "american", name: "American", icon: "🍔" },
  { id: "chinese", name: "Chinese", icon: "🥡" },
];

const RestaurantCard = ({ restaurant, onViewMenu }) => (
  <div className="bg-gray-800/50 cursor-pointer border border-gray-700/30 backdrop-blur-xl hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 group overflow-hidden rounded-xl shadow-lg">
    {/* Mobile Card Layout - Horizontal (only on mobile) */}
    <div className="flex h-32 sm:hidden">
      {/* Image Section - Left 1/3 */}
      <div className="relative w-1/3 h-full">
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {restaurant.discount && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-2 py-1 rounded-full text-xs">
            {restaurant.discount}
          </span>
        )}
        {restaurant.featured && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-2 py-1 rounded-full text-xs">
            ⭐ Featured
          </span>
        )}
        {/* Heart Icon - Bottom Right of Image */}
        <button className="absolute bottom-2 right-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 p-1.5 rounded-full transition-all duration-200">
          <Heart className="w-3 h-3" />
        </button>
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
              Closed
            </span>
          </div>
        )}
      </div>

      {/* Content Section - Right 2/3 */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        {/* Top Section - Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-bold text-white line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
            <span className="text-white font-semibold text-xs">
              {restaurant.rating || "4.5"}
            </span>
          </div>
        </div>

        {/* Middle Section - Info Icons */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{restaurant.deliveryTime || "25-30 min"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{restaurant.distance || "0.5 km"}</span>
          </div>
        </div>

        {/* Bottom Section - Order Button */}
        <button
          onClick={() => onViewMenu(restaurant._id)}
          disabled={!restaurant.isOpen}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 rounded-lg transition-all duration-300 disabled:cursor-not-allowed text-sm"
        >
          {restaurant.isOpen ? "Order Now" : "Closed"}
        </button>
      </div>
    </div>

    {/* Desktop Card Layout - Vertical (sm and above) */}
    <div className="hidden sm:block">
      <div className="relative">
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-32 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {restaurant.discount && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-3 py-1 rounded-full text-xs">
            {restaurant.discount}
          </span>
        )}
        {restaurant.featured && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 rounded-full text-xs">
            ⭐ Featured
          </span>
        )}
        <button className="absolute bottom-3 right-3 border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200">
          <Heart className="w-4 h-4" />
        </button>
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white text-lg px-4 py-2 rounded-full font-semibold">
              Closed
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {restaurant.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {restaurant.description || "Campus Canteen"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white font-semibold text-sm">
              {restaurant.rating || "4.5"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{restaurant.deliveryTime || "25-30 min"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{restaurant.distance || "0.5 km"}</span>
          </div>
        </div>
        <button
          onClick={() => onViewMenu(restaurant._id)}
          disabled={!restaurant.isOpen}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
        >
          {restaurant.isOpen ? "Order Now" : "Closed"}
        </button>
      </div>
    </div>
  </div>
);

const GroupOrderModal = ({
  isOpen,
  onClose,
  restaurants,
  onCreateOrder,
  isCreating,
  orderDetails,
  navigate,
}) => {
  const [selectedCanteen, setSelectedCanteen] = useState("");
  const rawToken = localStorage.getItem("token");
  // Remove quotes and whitespace from token
  const token = rawToken ? rawToken.replace(/^"|"$/g, "").trim() : null;

  const handleCreateOrder = () => {
    if (!selectedCanteen) {
      toast.error("Please select a canteen.");
      return;
    }
    if (!token) {
      toast.error("Authentication error: No token found. Please log in.");
      navigate("/login"); // Redirect to login page
      return;
    }
    onCreateOrder(selectedCanteen, token);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent pb-2">
            Start a New Group Order
          </h2>
          <p className="text-gray-400">
            {orderDetails
              ? "Share this link or QR code with your friends to join the order."
              : "Select a canteen to create a group order."}
          </p>
        </div>

        {!orderDetails ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Select Canteen
              </label>
              <select
                value={selectedCanteen}
                onChange={(e) => setSelectedCanteen(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-red-500"
              >
                <option value="">Choose a Canteen</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={isCreating || !selectedCanteen}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Group Order"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
              Group Order Created! 🎉
            </h3>

            {orderDetails.qrCodeUrl && (
              <div className="mt-4 flex flex-col items-center">
                <div className="p-4 bg-gray-700 rounded-lg shadow-lg">
                  <img
                    src={orderDetails.qrCodeUrl}
                    alt="Group Order QR Code"
                    className="w-48 h-48 rounded"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Scan QR code to join
                </p>
              </div>
            )}

            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Group Link:
              </label>
              <div className="bg-gray-800 p-3 rounded border mb-3">
                <p className="text-red-400 font-mono text-sm break-all">
                  {orderDetails.groupLink}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `https://campus-bites-c7pe.vercel.app/group-order?link=${orderDetails.groupLink}`
                    )
                  }
                  className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button
                  onClick={() =>
                    navigate(`/group-order?link=${orderDetails.groupLink}`)
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  Go to Group Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const { Profile } = useSelector((state) => state.Profile);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGroupOrderModalOpen, setIsGroupOrderModalOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [groupOrderDetails, setGroupOrderDetails] = useState(null);
  const [cartItems] = useState([]); // Mock cart state
  const navigate = useNavigate();

  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Simulate API call to fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const result = await GetAllCanteens(Profile?.campus?._id);
        const newData = result.map((ele) => ({
          ...ele,
          image: ele?.owner?.profileImage,
        }));
        setRestaurants(newData);
      } catch (err) {
        setError(err.message || "Failed to fetch restaurants");
        toast.error(err.message || "Failed to fetch restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [Profile]);

  // Optimized filtering with useMemo
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchLower) ||
        (restaurant.description &&
          restaurant.description.toLowerCase().includes(searchLower)) ||
        (restaurant.address &&
          restaurant.address.toLowerCase().includes(searchLower)) ||
        (restaurant.contactPersonName &&
          restaurant.contactPersonName.toLowerCase().includes(searchLower)) ||
        (restaurant.email &&
          restaurant.email.toLowerCase().includes(searchLower));

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "indian" &&
          restaurant.name.toLowerCase().includes("indian")) ||
        (selectedCategory === "italian" &&
          restaurant.name.toLowerCase().includes("italian")) ||
        (selectedCategory === "healthy" &&
          restaurant.name.toLowerCase().includes("healthy")) ||
        (selectedCategory === "american" &&
          restaurant.name.toLowerCase().includes("american")) ||
        (selectedCategory === "chinese" &&
          restaurant.name.toLowerCase().includes("chinese"));

      return matchesSearch && matchesCategory;
    });
  }, [restaurants, searchQuery, selectedCategory]);

  // Optimized handlers with useCallback
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleViewMenu = (restaurantId) => {
    navigate(`/canteen/${restaurantId}`);
  };

  const handleCreateGroupOrder = useCallback(async (selectedCanteen, token) => {
    setIsCreatingOrder(true);
    try {
      console.log("Sending create group order request:", {
        url: "https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/create-order",
        method: "POST",
        bodyData: { canteen: selectedCanteen },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!token) {
        throw new Error("Authentication error: No token found. Please log in.");
      }

      const res = await fetch(
        "https://cbbackend-kvp6.onrender.com/api/v1/groupOrder/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ canteen: selectedCanteen }),
        }
      );

      const data = await res.json();
      console.log("Create group order response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to create group order");
      }

      setGroupOrderDetails(data.data);
      toast.success("Group Order Created!");
    } catch (error) {
      console.error("Group order creation error:", {
        message: error.message,
        response: error.response?.data,
      });
      toast.error(error.message || "Failed to create group order");
    } finally {
      setIsCreatingOrder(false);
    }
  }, []);

  const resetGroupOrderFlow = useCallback(() => {
    setGroupOrderDetails(null);
    setIsGroupOrderModalOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white text-xl">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading restaurants...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-950">
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="relative p-8 pt-19 w-full">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Hey there,{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Student!
                  </span>
                </h1>
                <p className="text-gray-400 text-lg">
                  What are you craving today?
                </p>
              </div>
              <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cartItemsCount})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search for restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-20 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl px-4 py-2 text-white transition-all duration-200">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      : "border border-gray-700 text-gray-400 hover:bg-gray-800 bg-transparent"
                  } rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 font-semibold flex items-center gap-2`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <AdvertisementBanner />
          </div>
          {/* Group Order Banner */}
          <div className="mb-12">
            <div className="border border-red-500 bg-red-600 shadow-xl text-white rounded-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-bold">Order with Friends!</h3>
                    <p className="text-sm opacity-90">
                      Start a group order and save on delivery fees. Everyone
                      pays for their own items!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGroupOrderModalOpen(true)}
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Create Group Order
                </button>
              </div>
            </div>
          </div>

          {/* Restaurants Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {searchQuery ? "Search Results" : "All Restaurants"}
              </h2>
              {searchQuery && (
                <p className="text-gray-400">
                  {filteredRestaurants.length} restaurant
                  {filteredRestaurants.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No restaurants found
                </h3>
                <p className="text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                    onViewMenu={handleViewMenu}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Order Modal */}
      <GroupOrderModal
        isOpen={isGroupOrderModalOpen}
        onClose={resetGroupOrderFlow}
        restaurants={restaurants}
        onCreateOrder={handleCreateGroupOrder}
        isCreating={isCreatingOrder}
        orderDetails={groupOrderDetails}
        navigate={navigate}
      />
    </div>
  );
}
