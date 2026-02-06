import { useEffect } from "react";
import InventoryTable from "../components/InventoryTable";
import ProfileCompletionIndicator from "../components/ProfileCompletionIndicator";
import AddressManager from "../components/AddressManager";
import UserProfile from "../components/UserProfile";

export default function Dashboard() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="space-y-6">
        {/* User Profile Section */}
        <UserProfile />

        {/* Profile Completion Indicator */}
        <ProfileCompletionIndicator />

        {/* Address Manager */}
        <AddressManager />

        {/* Inventory Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              📦 Inventory Management
            </h2>
            <InventoryTable />
          </div>
        </div>
      </div>
    </div>
  );
}
