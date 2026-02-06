import { useEffect, useState } from "react";
import API from "../services/api";

export default function HospitalsTable() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifyFilter, setVerifyFilter] = useState("all");

  const [selectedHospital, setSelectedHospital] = useState(null);

  // 🔴 Confirmation modal state
  const [confirmHospital, setConfirmHospital] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");

  // 🔄 Fetch hospitals
  const fetchHospitals = async () => {
    try {
      const res = await API.get("/auth/hospitals");
      setHospitals(res.data);
    } catch (err) {
      console.error("Failed to fetch hospitals", err);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // 🔍 Search + Filters
  const filteredHospitals = hospitals.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || h.status === statusFilter;

    const matchVerify =
      verifyFilter === "all" ||
      (verifyFilter === "verified" && h.isVerified) ||
      (verifyFilter === "notVerified" && !h.isVerified);

    return matchSearch && matchStatus && matchVerify;
  });

  // ✅ Confirm status toggle
  const confirmToggleStatus = async () => {
    if (!confirmHospital) return;

    try {
      await API.patch(
        `/auth/hospital/${confirmHospital._id}/status`
      );
      fetchHospitals();
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setConfirmHospital(null);
      setConfirmAction("");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-8">
      <h2 className="text-xl font-bold mb-4">Hospitals</h2>

      {/* 🔍 Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          className="border p-2 rounded"
          value={verifyFilter}
          onChange={(e) => setVerifyFilter(e.target.value)}
        >
          <option value="all">All Verification</option>
          <option value="verified">Verified</option>
          <option value="notVerified">Not Verified</option>
        </select>
      </div>

      {/* 📋 Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Verified</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredHospitals.map((h) => (
            <tr key={h._id} className="border-t">
              <td className="p-2">{h.name}</td>
              <td className="p-2">{h.email}</td>
              <td className="p-2">{h.isVerified ? "✅" : "❌"}</td>
              <td className="p-2">
                <span
                  className={
                    h.status === "approved"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {h.status}
                </span>
              </td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => setSelectedHospital(h)}
                  className="px-3 py-1 bg-gray-600 text-white rounded"
                >
                  View
                </button>

                <button
                  onClick={() => {
                    setConfirmHospital(h);
                    setConfirmAction(
                      h.status === "approved" ? "block" : "approve"
                    );
                  }}
                  className={`px-3 py-1 rounded text-white ${
                    h.status === "approved"
                      ? "bg-red-600"
                      : "bg-green-600"
                  }`}
                >
                  {h.status === "approved" ? "Block" : "Approve"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🧾 Hospital Details Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-xl font-bold mb-4">
              Hospital Details
            </h3>

            <p><b>Name:</b> {selectedHospital.name}</p>
            <p><b>Email:</b> {selectedHospital.email}</p>
            <p><b>Verified:</b> {selectedHospital.isVerified ? "Yes" : "No"}</p>
            <p><b>Status:</b> {selectedHospital.status}</p>
            <p>
              <b>Registered:</b>{" "}
              {new Date(selectedHospital.createdAt).toLocaleDateString()}
            </p>

            <button
              onClick={() => setSelectedHospital(null)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ Confirmation Modal */}
      {confirmHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Confirm Action
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold text-red-600">
                {confirmAction}
              </span>{" "}
              <b>{confirmHospital.name}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmHospital(null);
                  setConfirmAction("");
                }}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={confirmToggleStatus}
                className={`px-4 py-2 rounded text-white ${
                  confirmAction === "block"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Yes, {confirmAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
