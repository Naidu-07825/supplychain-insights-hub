import { useEffect, useState } from "react";
import API from "../services/api";
import { connectSocket } from "../services/socket";
import OrderDetailsModal from "../components/OrderDetailsModal";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/admin");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const socket = connectSocket();
    socket?.on("orderPlaced", (order) => {
      setOrders((prev) => [order, ...prev]);
    });
    socket?.on("orderStatusChanged", (order) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    });
    socket?.on("orderDeleted", (orderId) => {
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    });
  }, []);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = !filterStatus || order.status === filterStatus;
    const matchSearch = 
      order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const getStatusBadgeColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Accepted: "bg-blue-100 text-blue-800",
      Packed: "bg-purple-100 text-purple-800",
      Shipped: "bg-indigo-100 text-indigo-800",
      "Out for Delivery": "bg-orange-100 text-orange-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📋 All Orders</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Total Orders: {orders.length}</p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Search by hospital name, email, phone, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⚙️ Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Order ID
                </th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Hospital/Company
                </th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Phone
                </th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Items
                </th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Amount
                </th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Order ID */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                    <div>
                      <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {order.orderId}
                      </span>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {order._id.substring(0, 8)}...
                      </div>
                    </div>
                  </td>

                  {/* Hospital Name */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm">
                    <div className="font-semibold text-gray-900 dark:text-white">{order.user?.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{order.user?.email}</div>
                  </td>

                  {/* Phone */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm">
                    <div className="text-gray-900 dark:text-white font-medium">{order.phone}</div>
                    {order.altPhone && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">{order.altPhone}</div>
                    )}
                  </td>

                  {/* Items Count */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm">
                    <div className="text-gray-900 dark:text-white">{order.items.length} item(s)</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item._id}>{item.name.substring(0, 20)}...</div>
                      ))}
                      {order.items.length > 2 && (
                        <div>+{order.items.length - 2} more</div>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      ₹{order.finalAmount?.toFixed(2) || "0.00"}
                    </div>
                    {order.discount > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Disc: -₹{order.discount?.toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {formatDate(order.createdAt)}
                  </td>

                  {/* Status */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="border border-gray-200 dark:border-gray-600 px-4 py-3 text-sm">
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      👁️ View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={modalOpen}
        onClose={closeModal}
        onStatusUpdate={fetchOrders}
      />
    </div>
  );
}
