import { useEffect, useState } from "react";
import API from "../services/api";
import { connectSocket } from "../services/socket";
import OrderTimeline from "../components/OrderTimeline";

export default function MyOrders() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reorderingId, setReorderingId] = useState(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAltPhone, setEditAltPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const statusOptions = [
    "Pending",
    "Accepted",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async (search = "", status = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      const url = `/orders/me?${params.toString()}`;
      const res = await API.get(url);
      setAllOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const socket = connectSocket();

    // Listen for real-time order updates
    socket?.on("orderUpdated", (order) => {
      setAllOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      setFilteredOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    });

    socket?.on("orderCancelled", (order) => {
      setAllOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      setFilteredOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    });

    socket?.on("orderStatusChanged", (order) => {
      setAllOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      setFilteredOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    });

    return () => {
      socket?.off("orderUpdated");
      socket?.off("orderCancelled");
      socket?.off("orderStatusChanged");
    };
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchOrders(value, statusFilter);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    fetchOrders(searchTerm, value);
  };

  const handleReorder = async (orderId) => {
    if (!window.confirm("Place the same order again?")) return;

    try {
      setReorderingId(orderId);
      setReorderLoading(true);

      const res = await API.post(`/orders/${orderId}/reorder`, {});

      // Add the new order to the list
      setAllOrders((prev) => [res.data.order, ...prev]);
      setFilteredOrders((prev) => [res.data.order, ...prev]);

      alert("Order placed successfully!");
    } catch (err) {
      console.error("Failed to reorder:", err);
      alert(
        err.response?.data?.msg || "Failed to place re-order. Please try again."
      );
    } finally {
      setReorderingId(null);
      setReorderLoading(false);
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    if (order.items.length > 0) {
      setEditQty(order.items[0].quantity);
    }
    setEditAddress(order.address);
    setEditPhone(order.phone);
    setEditAltPhone(order.altPhone || "");
    setEditNotes(order.notes || "");
  };

  const handleSaveEdit = async () => {
    if (!editAddress || !editPhone) {
      alert("Please enter delivery address and phone number");
      return;
    }

    try {
      setEditLoading(true);
      const res = await API.patch(`/orders/${editingOrder._id}/edit`, {
        items: editingOrder.items.map((item) => ({
          product: item.product._id || item.product,
          quantity: editQty,
        })),
        address: editAddress,
        phone: editPhone,
        altPhone: editAltPhone,
        notes: editNotes,
      });

      // Update the order in the list
      setAllOrders((prev) =>
        prev.map((o) => (o._id === editingOrder._id ? res.data : o))
      );
      setFilteredOrders((prev) =>
        prev.map((o) => (o._id === editingOrder._id ? res.data : o))
      );

      setEditingOrder(null);
      alert("Order updated successfully!");
    } catch (err) {
      console.error("Failed to edit order:", err);
      alert(err.response?.data?.msg || "Failed to update order. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your orders in real-time and manage your purchases
            </p>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search orders by product name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Orders Count */}
          {filteredOrders.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Showing {filteredOrders.length} of {allOrders.length} orders
            </p>
          )}

          {filteredOrders.length === 0 && allOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                You haven't placed any orders yet.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No orders match your search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          Order #<span className="text-blue-600 dark:text-blue-400">{order.orderId}</span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right flex flex-col gap-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === "Cancelled"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                              : order.status === "Delivered"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                          }`}
                        >
                          {order.status}
                        </span>
                        <div className="flex gap-2">
                          {order.status === "Pending" && (
                            <button
                              onClick={() => handleEditClick(order)}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {order.status === "Delivered" && (
                            <button
                              onClick={() => handleReorder(order._id)}
                              disabled={reorderingId === order._id && reorderLoading}
                              className="text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
                            >
                              {reorderingId === order._id && reorderLoading
                                ? "Reordering..."
                                : "🔄 Reorder"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Notes if present */}
                  {order.notes && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 border-b">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                        📝 Special Instructions
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">
                        {order.notes}
                      </p>
                  </div>
                  )}
                  {/* Order Items */}
                  <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {item.quantity} × ₹{item.price?.toFixed(2) || "N/A"}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{item.subtotal?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  {order.totalPrice !== undefined && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Order Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ₹{order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                        {order.discountPercentage > 0 && (
                          <div className="bg-white/60 dark:bg-gray-700/40 p-2 rounded border-l-4 border-green-500">
                            <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                              <span>Discount ({order.discountPercentage}%):</span>
                              <span>-₹{order.discountAmount?.toFixed(2) || order.discount?.toFixed(2) || "0.00"}</span>
                            </div>
                          </div>
                        )}
                        <div className="border-t border-blue-200 dark:border-blue-600 pt-2 mt-2 flex justify-between">
                          <span className="font-bold text-gray-900 dark:text-white">
                            Final Amount:
                          </span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ₹
                            {order.finalAmount?.toFixed(2) ||
                              order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Payment Mode:{" "}
                          <span className="font-semibold">{order.paymentMode || "COD"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Details */}
                  <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Shipping Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Address</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {order.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {order.phone}
                          {order.altPhone && ` / ${order.altPhone}`}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {order.contactEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <OrderTimeline order={order} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Edit Order #{editingOrder.orderId}
            </h3>

            {editingOrder.status !== "Pending" && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-sm">
                <p className="text-red-800 dark:text-red-200">
                  ⚠️ This order can no longer be edited. Editing is only allowed for Pending orders.
                </p>
              </div>
            )}

            {editingOrder.status === "Pending" && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={editQty}
                      onChange={(e) => setEditQty(Number(e.target.value))}
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      rows="3"
                      placeholder="Enter complete delivery address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Primary phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Alt Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={editAltPhone}
                        onChange={(e) => setEditAltPhone(e.target.value)}
                        placeholder="Alternate phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      📝 Special Instructions
                    </label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows="3"
                      placeholder="Add any special instructions or notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded font-medium transition"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}

            {editingOrder.status !== "Pending" && (
              <button
                onClick={() => setEditingOrder(null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
