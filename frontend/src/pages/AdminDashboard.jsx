import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import HospitalsTable from "../components/HospitalsTable";
import StatsCard from "../components/StatsCard";
import AdminContacts from "./AdminContacts";
import API from "../services/api";
import { connectSocket, getSocket } from "../services/socket";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    approvedHospitals: 0,
    blockedHospitals: 0,
  });

  const [activeTab, setActiveTab] = useState("hospitals");

  /* =========================
     📊 FETCH DASHBOARD STATS
  ========================= */
  const fetchStats = async () => {
    try {
      const res = await API.get("/auth/hospitals");
      const hospitals = res.data;

      setStats({
        totalHospitals: hospitals.length,
        approvedHospitals: hospitals.filter(
          (h) => h.status === "approved"
        ).length,
        blockedHospitals: hospitals.filter(
          (h) => h.status === "blocked"
        ).length,
      });
    } catch (error) {
      console.error("❌ Failed to load dashboard stats", error);
    }
  };

  /* =========================
     🚀 INITIAL LOAD
  ========================= */
  useEffect(() => {
    fetchStats();
  }, []);

  /* =========================
     🔔 SOCKET: ADMIN EVENTS
  ========================= */
  useEffect(() => {
    connectSocket(); // admin token already handled in service
    const socket = getSocket();
    if (!socket) return;

    socket.on("ADMIN_NEW_ORDER", (data) => {
      console.log("🆕 New order received:", data.order);
      alert("🆕 New order received!");
    });

    socket.on("CHAT_MESSAGE", (data) => {
      console.log("💬 New chat message from hospital");
      console.log("👤 Hospital ID:", data.userId);
      console.log("📨 Message:", data.message);
      console.log("🎯 Intent:", data.intent); // order / payment / emergency
    });

    return () => {
      socket.off("ADMIN_NEW_ORDER");
      socket.off("CHAT_MESSAGE");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* 🔀 TAB NAVIGATION */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("hospitals")}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === "hospitals"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            🏥 Hospitals
          </button>

          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === "contacts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            📬 Contact Messages
          </button>
        </div>

        {activeTab === "hospitals" ? (
          <>
            {/* 📊 STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Hospitals"
                value={stats.totalHospitals}
              />
              <StatsCard
                title="Approved Hospitals"
                value={stats.approvedHospitals}
                color="green"
              />
              <StatsCard
                title="Blocked Hospitals"
                value={stats.blockedHospitals}
                color="red"
              />
            </div>

            {/* 🏥 TABLE */}
            <HospitalsTable />
          </>
        ) : (
          <AdminContacts />
        )}
      </div>
    </div>
  );
}