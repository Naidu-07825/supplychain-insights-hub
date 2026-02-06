import React from "react";

const STATUS_STEPS = [
  { key: "Pending", label: "Pending", icon: "📋" },
  { key: "Accepted", label: "Accepted", icon: "✅" },
  { key: "Packed", label: "Packed", icon: "📦" },
  { key: "Shipped", label: "Shipped", icon: "🚚" },
  { key: "Out for Delivery", label: "Out for Delivery", icon: "🚗" },
  { key: "Delivered", label: "Delivered", icon: "🏠" },
];

export default function OrderTimeline({ order }) {
  const isCancelled = order.status === "Cancelled";
  
  // Get the index of current status
  const currentStatusIndex = isCancelled ? -1 : STATUS_STEPS.findIndex(s => s.key === order.status);
  
  // Get timestamp for current status
  const getCurrentStatusTimestamp = () => {
    if (!order.statusHistory || !order.statusHistory.length) return null;
    const current = order.statusHistory.find(h => h.status === order.status);
    return current ? new Date(current.changedAt).toLocaleDateString() : null;
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Cancellation Alert */}
      {isCancelled && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⛔</span>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-200">Order Cancelled</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                <strong>Reason:</strong> {order.cancelReason || "No reason provided"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Cancelled on: {new Date(order.statusHistory.find(h => h.status === "Cancelled")?.changedAt || order.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {!isCancelled && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Order Progress</h4>
          <div className="relative">
            {/* Steps */}
            <div className="flex justify-between gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isActive = idx === currentStatusIndex;
                
                return (
                  <div key={step.key} className="flex-1">
                    {/* Connector Line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`h-1 mb-2 rounded transition-colors ${
                          idx < currentStatusIndex
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        style={{ marginBottom: "8px" }}
                      />
                    )}

                    {/* Step Circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-2 transition-all ${
                          isActive
                            ? "bg-blue-500 text-white ring-2 ring-blue-300 dark:ring-blue-700"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {isCompleted ? "✓" : step.icon}
                      </div>

                      {/* Label */}
                      <div
                        className={`text-center text-xs font-medium transition-colors ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <div>{step.label}</div>
                        {isCompleted && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(
                              order.statusHistory.find(h => h.status === step.key)?.changedAt || order.createdAt
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Status Info */}
            {currentStatusIndex >= 0 && (
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Current Status:</strong> {order.status}
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({getCurrentStatusTimestamp()})
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
