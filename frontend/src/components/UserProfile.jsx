import { useEffect, useState } from "react";
import API from "../services/api";

export default function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryAddress: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [addressList, setAddressList] = useState([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Try to get from addresses endpoint first (has profile completion data)
      try {
        const res = await API.get("/addresses/profile/completion");
        setProfileData(res.data);
        setFormData({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          deliveryAddress: {
            address: "",
            city: "",
            state: "",
            zipCode: "",
            phone: "",
          },
        });
        return;
      } catch (err) {
        // Fallback to auth endpoint if addresses fails
        const res = await API.get("/auth/me");
        setProfileData({
          user: {
            name: res.data.user.name,
            email: res.data.user.email,
            phone: res.data.user.phone,
            hasAddress: (res.data.user.deliveryAddresses?.length || 0) > 0,
          },
          completion: res.data.profileCompletion,
        });
        setFormData({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          deliveryAddress: {
            address: "",
            city: "",
            state: "",
            zipCode: "",
            phone: "",
          },
        });
      }

      // Fetch addresses
      try {
        const addressRes = await API.get("/addresses");
        setAddressList(addressRes.data.addresses);
      } catch (err) {
        console.log("Could not fetch addresses");
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
      setErrorMessage("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Hospital name is required");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Email address is required");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Phone number is required");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      // Update profile info
      const profileRes = await API.patch("/addresses/profile/update", {
        name: formData.name,
        phone: formData.phone,
      });

      // If address data is provided, add/update address
      // Only save if both address and phone are filled
      if (formData.deliveryAddress.address?.trim() && formData.deliveryAddress.phone?.trim()) {
        try {
          await API.post("/addresses", {
            label: "Home",
            address: formData.deliveryAddress.address.trim(),
            city: formData.deliveryAddress.city?.trim() || "",
            state: formData.deliveryAddress.state?.trim() || "",
            zipCode: formData.deliveryAddress.zipCode?.trim() || "",
            phone: formData.deliveryAddress.phone.trim(),
            isDefault: true,
          });
        } catch (err) {
          console.error("Failed to save address:", err);
          setErrorMessage(
            err.response?.data?.msg || "Failed to save address. Please check your delivery address details."
          );
          setSaving(false);
          return;
        }
      }

      setProfileData(profileRes.data);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Refresh addresses
      fetchProfileData();
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMessage(
        err.response?.data?.msg || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profileData?.user.name || "",
      email: profileData?.user.email || "",
      phone: profileData?.user.phone || "",
      deliveryAddress: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
      },
    });
    setErrorMessage("");
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const completion = profileData?.completion;
  const user = profileData?.user;
  const completionPercentage = completion?.percentage || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            👤 My Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal and contact information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ✏️ Edit Profile
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

      {/* Profile Completion Indicator */}
      {completion && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Profile Completion
            </h3>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {completionPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Completion Details */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              {completion.completedFields} of {completion.totalFields} fields completed
            </span>
            {completionPercentage === 100 ? (
              <span className="text-green-600 dark:text-green-400 font-semibold">
                ✓ Complete
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                {completion.missingFields.length} remaining
              </span>
            )}
          </div>

          {/* Missing Fields */}
          {completion.missingFields && completion.missingFields.length > 0 && (
            <div className="mt-3 p-2 bg-white dark:bg-gray-700/50 rounded text-sm">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Missing fields:
              </p>
              <ul className="space-y-1">
                {completion.missingFields.map((field) => (
                  <li
                    key={field}
                    className="text-gray-600 dark:text-gray-400 flex items-center gap-2"
                  >
                    <span>•</span>
                    <span className="capitalize">
                      {field === "deliveryAddress"
                        ? "Delivery Address"
                        : field}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* View Mode */}
      {!isEditing ? (
        <div className="space-y-4">
          {/* Hospital Name */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Hospital / Organization Name
            </label>
            <p className="text-lg text-gray-900 dark:text-white font-semibold">
              {user?.name || "Not provided"}
            </p>
          </div>

          {/* Email */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Email Address
            </label>
            <p className="text-lg text-gray-900 dark:text-white font-semibold break-all">
              {user?.email || "Not provided"}
            </p>
          </div>

          {/* Phone */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Primary Phone Number
            </label>
            <p className="text-lg text-gray-900 dark:text-white font-semibold">
              {user?.phone || "Not provided"}
            </p>
          </div>

          {/* Address Status */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Delivery Address
            </label>
            {user?.hasAddress ? (
              <p className="text-lg text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                ✅ Address saved
              </p>
            ) : (
              <p className="text-lg text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                ⚠️ No address added
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
              <span className="text-lg mt-0.5">💡</span>
              <span>
                Complete your profile to enable faster checkout and ensure accurate
                delivery information for your orders.
              </span>
            </p>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form className="space-y-4">
          {/* Hospital Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hospital / Organization Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter hospital or organization name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will be displayed on your orders
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number (e.g., 9876543210)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Used for order confirmations and delivery updates
            </p>
          </div>
          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              📍 Delivery Address
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.deliveryAddress.address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryAddress: {
                      ...prev.deliveryAddress,
                      address: e.target.value,
                    },
                  }))
                }
                placeholder="Enter your delivery address"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryAddress: {
                        ...prev.deliveryAddress,
                        city: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryAddress: {
                        ...prev.deliveryAddress,
                        state: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter state"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryAddress: {
                        ...prev.deliveryAddress,
                        zipCode: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter zip code"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Phone
                </label>
                <input
                  type="tel"
                  value={formData.deliveryAddress.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deliveryAddress: {
                        ...prev.deliveryAddress,
                        phone: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Additional Info */}
      {!isEditing && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            📋 What you can manage here:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">✓</span>
              <span>Update hospital/organization name</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">✓</span>
              <span>Manage primary phone number</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">✓</span>
              <span>View email address (cannot be changed)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              <span>
                Manage delivery addresses in the{" "}
                <span className="font-semibold">Delivery Addresses</span> section
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
