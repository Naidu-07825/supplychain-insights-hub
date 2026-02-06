import { useEffect, useState } from "react";
import API from "../services/api";

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [preferredAddressId, setPreferredAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    label: "Home",
    address: "",
    phone: "",
    altPhone: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/addresses");
      setAddresses(res.data.addresses);
      setPreferredAddressId(res.data.preferredAddressId);
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setErrorMessage("Failed to load addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      address: "",
      phone: "",
      altPhone: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
    setEditingId(null);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      if (!formData.address.trim()) {
        setErrorMessage("Address is required");
        setSaving(false);
        return;
      }

      if (!formData.phone.trim()) {
        setErrorMessage("Phone number is required");
        setSaving(false);
        return;
      }

      if (editingId) {
        // Update existing address
        const res = await API.patch(`/addresses/${editingId}`, formData);
        setAddresses((prev) =>
          prev.map((addr) => (addr._id === editingId ? res.data.address : addr))
        );
        setPreferredAddressId(res.data.address.isDefault ? editingId : preferredAddressId);
        setSuccessMessage("Address updated successfully!");
      } else {
        // Add new address
        const res = await API.post("/addresses", formData);
        setAddresses((prev) => [...prev, res.data.address]);
        if (formData.isDefault) {
          setPreferredAddressId(res.data.address._id);
        }
        setSuccessMessage("Address added successfully!");
      }

      resetForm();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save address:", err);
      setErrorMessage(
        err.response?.data?.msg || "Failed to save address. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label,
      address: address.address,
      phone: address.phone,
      altPhone: address.altPhone || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      isDefault: address.isDefault || false,
    });
    setEditingId(address._id);
    setShowForm(true);
    setErrorMessage("");
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      setErrorMessage("");
      await API.delete(`/addresses/${addressId}`);
      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));

      if (preferredAddressId === addressId) {
        const remainingAddresses = addresses.filter((addr) => addr._id !== addressId);
        setPreferredAddressId(
          remainingAddresses.length > 0 ? remainingAddresses[0]._id : null
        );
      }
      setSuccessMessage("Address deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete address:", err);
      setErrorMessage("Failed to delete address. Please try again.");
    }
  };

  const handleSetPreferred = async (addressId) => {
    try {
      setErrorMessage("");
      const res = await API.patch(`/addresses/${addressId}/set-preferred`);
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr._id === addressId,
        }))
      );
      setPreferredAddressId(addressId);
      setSuccessMessage("Preferred address updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to set preferred address:", err);
      setErrorMessage("Failed to update preferred address. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse text-center py-4">
          Loading addresses...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📍 Delivery Addresses
        </h2>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            + Add Address
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
          ✅ {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          ❌ {errorMessage}
        </div>
      )}

      {/* Address List */}
      {addresses.length > 0 && !showForm && (
        <div className="space-y-4 mb-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-lg p-4 transition-all ${
                address.isDefault
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Preferred
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    {address.address}
                  </p>

                  {(address.city || address.state || address.zipCode) && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {[address.city, address.state, address.zipCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>📱 {address.phone}</p>
                    {address.altPhone && (
                      <p>📱 {address.altPhone}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetPreferred(address._id)}
                      className="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded transition-colors"
                    >
                      Set Preferred
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 px-3 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Address" : "Add New Address"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label *
              </label>
              <select
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                name="altPhone"
                value={formData.altPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Set as preferred address
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {saving ? "Saving..." : editingId ? "Update Address" : "Add Address"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              disabled={saving}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No addresses added yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      )}
    </div>
  );
}
