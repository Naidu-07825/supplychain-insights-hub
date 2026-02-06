import { useState } from "react";
import API from "../services/api";

export default function OrderDetailsModal({ order, isOpen, onClose, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "");
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);

  if (!isOpen || !order) return null;

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      alert("Please select a status");
      return;
    }

    try {
      setIsUpdating(true);
      await API.patch(`/orders/${order._id}/status`, { status: selectedStatus });
      alert("Order status updated successfully!");
      setShowStatusForm(false);
      onStatusUpdate?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please enter a cancel reason");
      return;
    }

    try {
      setIsUpdating(true);
      await API.post(`/orders/${order._id}/cancel`, { reason: cancelReason });
      alert("Order cancelled successfully!");
      setCancelReason("");
      setShowCancelForm(false);
      onStatusUpdate?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to cancel order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("Are you sure? This will permanently delete the order.")) return;

    try {
      setIsUpdating(true);
      await API.delete(`/orders/${order._id}`);
      alert("Order deleted successfully!");
      onStatusUpdate?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to delete order");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="text-blue-100 text-sm">Order ID: <span className="text-white font-bold text-base">{order.orderId}</span> ({order._id.substring(0, 8)}...)</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 w-8 h-8 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Current Status:</span>
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          {/* Order Date & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                📅 Order Date
              </label>
              <p className="text-gray-900 dark:text-white font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                💳 Payment Method
              </label>
              <p className="text-gray-900 dark:text-white font-medium">{order.paymentMode || "COD"}</p>
            </div>
          </div>

          {/* Hospital/Company Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🏥 Hospital / Company Information
            </h3>
            <div className="space-y-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</label>
                <p className="text-gray-900 dark:text-white font-semibold">{order.user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</label>
                <p className="text-gray-900 dark:text-white font-semibold break-all">{order.user?.email || order.contactEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</label>
                <p className="text-gray-900 dark:text-white font-semibold">{order.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Alternative Phone:</label>
                <p className="text-gray-900 dark:text-white font-semibold">{order.altPhone || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📍 Delivery Address
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{order.address}</p>
            </div>
          </div>

          {/* Special Instructions/Notes */}
          {order.notes && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                📝 Special Instructions
              </h3>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📦 Order Items ({order.items.length})
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)} = ₹{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Total Price:</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{order.totalPrice?.toFixed(2) || "0.00"}</span>
              </div>
              {order.discountPercentage > 0 && (
                <div className="bg-white/60 dark:bg-gray-700/40 p-2 rounded border-l-4 border-green-500">
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                    <span>Discount ({order.discountPercentage}%):</span>
                    <span>-₹{order.discountAmount?.toFixed(2) || order.discount?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Final Amount:</span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  ₹{order.finalAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          {showStatusForm && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Update Status</h3>
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select new status</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleStatusChange}
                    disabled={isUpdating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    {isUpdating ? "Updating..." : "Update Status"}
                  </button>
                  <button
                    onClick={() => setShowStatusForm(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Order Form */}
          {showCancelForm && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Cancel Order</h3>
              <div className="space-y-3">
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelOrder}
                    disabled={isUpdating}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    {isUpdating ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                  <button
                    onClick={() => setShowCancelForm(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showStatusForm && !showCancelForm && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-2">
              <button
                onClick={() => setShowStatusForm(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                📊 Update Status
              </button>
              {order.status !== "Cancelled" && (
                <button
                  onClick={() => setShowCancelForm(true)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  ⛔ Cancel Order
                </button>
              )}
              <button
                onClick={handleDeleteOrder}
                disabled={isUpdating}
                className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
