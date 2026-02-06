import { useState } from "react";
import Navbar from "../components/Navbar";
import ProductsList from "../components/ProductsList";
import UserProfile from "../components/UserProfile";
import HospitalChat from "../components/HospitalChat";

export default function HospitalDashboard() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 🔐 Get logged-in hospital user
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Hospital Dashboard" />

      <div className="p-6 space-y-6">
        {/* 🔝 Profile Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            👤 My Profile
          </button>
        </div>

        {/* 📦 Products */}
        <ProductsList />

        {/* 🤖 CHATBOT (MANDATORY) */}
        <HospitalChat user={user} />
      </div>

      {/* 👤 PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hospital Profile
              </h2>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}