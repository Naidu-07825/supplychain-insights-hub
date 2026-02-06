import React from "react";

export default function ProductStockWarning({ product, threshold = 10 }) {
  if (!product || product.quantity >= threshold) {
    return null; // No warning if stock is adequate
  }

  const isVeryLow = product.quantity <= 3;
  const isLow = product.quantity < threshold;

  return (
    <div
      className={`p-3 rounded-lg border-l-4 flex items-start gap-3 ${
        isVeryLow
          ? "bg-red-50 dark:bg-red-900/20 border-red-500"
          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
      }`}
    >
      <span className="text-xl flex-shrink-0">{isVeryLow ? "🔴" : "⚠️"}</span>
      <div className="flex-1">
        <h4 className={`font-semibold text-sm ${
          isVeryLow
            ? "text-red-800 dark:text-red-200"
            : "text-yellow-800 dark:text-yellow-200"
        }`}>
          {isVeryLow ? "Critical Stock Level" : "Low Stock Warning"}
        </h4>
        <p className={`text-sm mt-1 ${
          isVeryLow
            ? "text-red-700 dark:text-red-300"
            : "text-yellow-700 dark:text-yellow-300"
        }`}>
          Only <strong>{product.quantity}</strong> unit{product.quantity !== 1 ? 's' : ''} available.
          {isVeryLow && " Please order soon to avoid stockout."}
        </p>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isVeryLow ? "bg-red-500" : "bg-yellow-500"
            }`}
            style={{ width: `${Math.min((product.quantity / threshold) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
