import { useEffect, useState } from "react";
import API from "../services/api";

export default function InventoryTable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get("/inventory").then((res) => {
      setItems(res.data);
    });
  }, []);

  return (
  <div className="bg-white shadow-md rounded-lg mt-6 overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-gray-100 border-b">
        <tr>
          <th className="p-4">Item</th>
          <th className="p-4">Quantity</th>
          <th className="p-4">Status</th>
        </tr>
      </thead>

      <tbody>
        {items.map((item) => (
          <tr key={item._id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium">{item.itemName}</td>
            <td className="p-4">{item.quantity}</td>
            <td className="p-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === "CRITICAL"
                    ? "bg-red-100 text-red-700"
                    : item.status === "LOW"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}
