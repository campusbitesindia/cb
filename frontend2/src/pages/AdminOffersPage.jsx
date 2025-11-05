import { useEffect, useState } from "react";
import { Button } from "../component/ui/button";
import { Input } from "../component/ui/input";
import { Textarea } from "../component/ui/textarea";
import { Label } from "../component/ui/label";
import { Switch } from "../component/ui/Switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../component/ui/dialog";
import { Badge } from "../component/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../component/ui/select";
import apiConnector from "../services/apiConnector";
import { OfferApi } from "../services/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  RefreshCw,
  Tag,
  Percent,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Create/Edit Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    MinValue: "",
    MaxValue: "",
    discount: "",
    isUnique: "false",
    MaxDiscount: "",
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  const { token } = useSelector((state) => state.Auth);

  // Fetch all offers
  useEffect(() => {
    fetchOffers();
  }, [token]);

  // Filter offers based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredOffers(offers);
    } else {
      setFilteredOffers(
        offers.filter(
          (offer) =>
            offer.description?.toLowerCase().includes(search.toLowerCase()) ||
            offer._id?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, offers]);

  async function fetchOffers() {
    setLoading(true);
    setError("");
    try {
      const res = await apiConnector(OfferApi.getAllOffers, "GET", null, {
        Authorization: `Bearer ${token}`,
      });

      if (res.data.success && res.data.data) {
        setOffers(res.data.data);
        setFilteredOffers(res.data.data);
      } else {
        setOffers([]);
        setFilteredOffers([]);
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load offers"
      );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load offers"
      );
      setOffers([]);
      setFilteredOffers([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingOffer(null);
    setFormData({
      description: "",
      MinValue: "",
      MaxValue: "",
      discount: "",
      isUnique: "false",
      MaxDiscount: "",
      isActive: true,
    });
    setDialogOpen(true);
  }

  function openEditDialog(offer) {
    setEditingOffer(offer);
    setFormData({
      description: offer.description || "",
      MinValue: offer.MinValue?.toString() || "",
      MaxValue: offer.MaxValue?.toString() || "",
      discount: offer.discount?.toString() || "",
      isUnique: offer.isUnique?.toString() || "false",
      MaxDiscount: offer.MaxDiscount?.toString() || "",
      isActive: offer.isActive ?? true,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    // Validation
    if (
      !formData.MinValue ||
      !formData.MaxValue ||
      !formData.discount ||
      formData.isUnique === undefined ||
      !formData.MaxDiscount
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const numMinValue = parseFloat(formData.MinValue);
    const numMaxValue = parseFloat(formData.MaxValue);
    const numDiscount = parseFloat(formData.discount);
    const numMaxDiscount = parseFloat(formData.MaxDiscount);

    if (
      isNaN(numMinValue) ||
      isNaN(numMaxValue) ||
      isNaN(numDiscount) ||
      isNaN(numMaxDiscount)
    ) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (numMinValue >= numMaxValue) {
      toast.error("Minimum value must be less than maximum value");
      return;
    }

    if (numDiscount <= 0 || numDiscount > 100) {
      toast.error("Discount must be between 1 and 100");
      return;
    }

    setFormLoading(true);
    try {
      if (editingOffer) {
        // Update existing offer
        const updateData = {
          description: formData.description,
          MinValue: numMinValue,
          MaxValue: numMaxValue,
          discount: numDiscount,
          isUnique: formData.isUnique,
          MaxDiscount: numMaxDiscount,
          isActive: formData.isActive,
        };

        const res = await apiConnector(
          `${OfferApi.updateOffer}/${editingOffer._id}`,
          "PUT",
          updateData,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );

        if (res.data.success) {
          toast.success("Offer updated successfully");
          setDialogOpen(false);
          fetchOffers();
        } else {
          throw new Error(res.data.message || "Failed to update offer");
        }
      } else {
        // Create new offer
        const res = await apiConnector(
          OfferApi.createOffer,
          "POST",
          {
            description: formData.description,
            MinValue: numMinValue,
            MaxValue: numMaxValue,
            discount: numDiscount,
            isUnique: formData.isUnique,
            MaxDiscount: numMaxDiscount,
          },
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );

        if (res.data.success) {
          toast.success("Offer created successfully");
          setDialogOpen(false);
          fetchOffers();
        } else {
          throw new Error(res.data.message || "Failed to create offer");
        }
      }
    } catch (err) {
      console.error("Error saving offer:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save offer"
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive(offer, newActiveState) {
    try {
      const updateData = {
        isActive: newActiveState,
      };

      const res = await apiConnector(
        `${OfferApi.updateOffer}/${offer._id}`,
        "PUT",
        updateData,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (res.data.success) {
        toast.success(
          `Offer ${newActiveState ? "activated" : "deactivated"} successfully`
        );
        fetchOffers();
      } else {
        throw new Error(res.data.message || "Failed to update offer");
      }
    } catch (err) {
      console.error("Error toggling offer status:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update offer status"
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#0a1f44] to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Tag className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Offers</h1>
            <p className="text-slate-300 mt-1">
              Create and manage discount offers
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchOffers}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-[#0a1f44] to-blue-500 hover:from-[#0a1f44] hover:to-blue-600 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Offer
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="Search offers by description or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 bg-white/10 border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Offers Table */}
      {loading ? (
        <div className="text-slate-300 py-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          Loading offers...
        </div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center bg-red-500/10 rounded-xl p-6">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white/10 rounded-xl">
          <table className="min-w-full text-white bg-white/5 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-white/10">
                <th className="px-4 py-3 font-semibold text-left">
                  Description
                </th>
                <th className="px-4 py-3 font-semibold text-left">Min Value</th>
                <th className="px-4 py-3 font-semibold text-left">Max Value</th>
                <th className="px-4 py-3 font-semibold text-left">
                  Discount %
                </th>
                <th className="px-4 py-3 font-semibold text-left">
                  Max Discount
                </th>
                <th className="px-4 py-3 font-semibold text-left">Type</th>
                <th className="px-4 py-3 font-semibold text-left">Status</th>
                <th className="px-4 py-3 font-semibold text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No offers found. Create your first offer!
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="border-b border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="px-4 py-3 text-white">
                      {offer.description || (
                        <span className="text-slate-400 italic">
                          No description
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-1">
                        <span className="text-green-400">₹</span>
                        {offer.MinValue}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-1">
                        <span className="text-green-400">₹</span>
                        {offer.MaxValue}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-1">
                        <Percent className="w-4 h-4 text-blue-400" />
                        {offer.discount}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-1">
                        <span className="text-green-400">₹</span>
                        {offer.MaxDiscount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          offer.isUnique === "true" ? "default" : "secondary"
                        }
                        className={
                          offer.isUnique === "true"
                            ? "bg-purple-500 hover:bg-purple-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }
                      >
                        {offer.isUnique === "true" ? "Unique" : "Multiple"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={offer.isActive}
                          onCheckedChange={(checked) =>
                            handleToggleActive(offer, checked)
                          }
                        />
                        <Badge
                          variant={offer.isActive ? "default" : "destructive"}
                          className={
                            offer.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          }
                        >
                          {offer.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        onClick={() => openEditDialog(offer)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-600 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              {editingOffer ? "Edit Offer" : "Create New Offer"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Enter offer description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, description: e.target.value }))
                }
                className="bg-slate-700 border-slate-500 text-white placeholder-gray-400 focus:border-slate-400 min-h-[80px]"
              />
            </div>

            {/* Min Value and Max Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue" className="text-slate-300">
                  Minimum Value <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={formData.MinValue}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, MinValue: e.target.value }))
                  }
                  className="bg-slate-700 border-slate-500 text-white placeholder-gray-400 focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxValue" className="text-slate-300">
                  Maximum Value <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="0"
                  value={formData.MaxValue}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, MaxValue: e.target.value }))
                  }
                  className="bg-slate-700 border-slate-500 text-white placeholder-gray-400 focus:border-slate-400"
                />
              </div>
            </div>

            {/* Discount and Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-slate-300">
                  Discount (%) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="10"
                  min="1"
                  max="100"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, discount: e.target.value }))
                  }
                  className="bg-slate-700 border-slate-500 text-white placeholder-gray-400 focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscount" className="text-slate-300">
                  Maximum Discount <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="0"
                  value={formData.MaxDiscount}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, MaxDiscount: e.target.value }))
                  }
                  className="bg-slate-700 border-slate-500 text-white placeholder-gray-400 focus:border-slate-400"
                />
              </div>
            </div>

            {/* Is Unique */}
            <div className="space-y-2">
              <Label htmlFor="isUnique" className="text-slate-300">
                Offer Type <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.isUnique}
                onValueChange={(value) =>
                  setFormData((f) => ({ ...f, isUnique: value }))
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-500 text-white focus:border-slate-400">
                  <SelectValue placeholder="Select offer type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-500">
                  <SelectItem
                    value="false"
                    className="text-white focus:bg-slate-600"
                  >
                    Multiple Use
                  </SelectItem>
                  <SelectItem
                    value="true"
                    className="text-white focus:bg-slate-600"
                  >
                    Single Use (Unique)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Is Active (only for edit) */}
            {editingOffer && (
              <div className="space-y-2">
                <Label htmlFor="isActive" className="text-slate-300">
                  Active Status
                </Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((f) => ({ ...f, isActive: checked }))
                    }
                  />
                  <span className="text-slate-300">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={formLoading}
              className="bg-gradient-to-r from-[#0a1f44] to-blue-500 hover:from-[#0a1f44] hover:to-blue-600 text-white font-semibold"
            >
              {formLoading
                ? editingOffer
                  ? "Updating..."
                  : "Creating..."
                : editingOffer
                ? "Update Offer"
                : "Create Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
