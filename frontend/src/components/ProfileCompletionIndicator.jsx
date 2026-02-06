import { useEffect, useState } from "react";
import API from "../services/api";

export default function ProfileCompletionIndicator() {
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  useEffect(() => {
    fetchCompletion();
  }, []);

  const fetchCompletion = async () => {
    try {
      const res = await API.get("/addresses/profile/completion");
      setCompletion(res.data.completion);
      setFormData({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile completion:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch("/addresses/profile/update", formData);
      setCompletion(res.data.completion);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!completion || completion.percentage === 100) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              Profile Complete!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your profile is 100% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">
            Complete Your Profile
          </h3>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {completion.percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>

        {/* Missing Fields */}
        {completion.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              Missing information:
            </p>
            <ul className="space-y-1">
              {completion.missingFields.map((field) => (
                <li
                  key={field}
                  className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2"
                >
                  <span>•</span>
                  <span className="capitalize">
                    {field === "deliveryAddress" ? "Delivery Address" : field}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Toggle */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Update Profile
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-3 bg-white dark:bg-gray-800 p-3 rounded">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
          💡 Complete your profile for faster checkout and better recommendations
        </p>
      </div>
    </div>
  );
}
