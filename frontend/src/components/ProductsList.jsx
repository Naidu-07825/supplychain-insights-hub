import { useEffect, useState } from "react";
import API from "../services/api";
import { connectSocket, getSocket } from "../services/socket";
import ProductStockWarning from "./ProductStockWarning";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [lowStockAlerts, setLowStockAlerts] = useState(new Set());
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchAddresses();
    const socket = connectSocket();
    socket?.on("lowStock", (data) => {
      setLowStockAlerts((prev) => new Set([...prev, data.product]));
      // Refetch to get updated quantities
      fetchProducts();
    });
    socket?.on("orderStatusChanged", (order) => {
      fetchProducts();
    });

    return () => {
      socket?.off("lowStock");
      socket?.off("orderStatusChanged");
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/addresses");
      setSavedAddresses(res.data.addresses);
      if (res.data.preferredAddressId) {
        setSelectedAddressId(res.data.preferredAddressId);
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  const fetchSuggestions = async (productId) => {
    try {
      const res = await API.get(`/orders/suggestions/${productId}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error("Failed to load suggestions", err);
      setSuggestions([]);
    }
  };

  const openOrder = (p) => {
    setSelected(p);
    setQty(1);
    setNotes("");
    setUseCustomAddress(false);

    // Auto-fill from selected address if available
    if (selectedAddressId && savedAddresses.length > 0) {
      const addr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (addr) {
        setAddress(addr.address);
        setPhone(addr.phone);
        setAltPhone(addr.altPhone || "");
      }
    }

    // Fetch product suggestions
    fetchSuggestions(p._id);
  };

  const handleAddressChange = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);

    if (addressId !== "custom") {
      const addr = savedAddresses.find((a) => a._id === addressId);
      if (addr) {
        setAddress(addr.address);
        setPhone(addr.phone);
        setAltPhone(addr.altPhone || "");
        setUseCustomAddress(false);
      }
    } else {
      setUseCustomAddress(true);
      setAddress("");
      setPhone("");
      setAltPhone("");
    }
  };

  const placeOrder = async () => {
    if (!selected) return;
    
    if (!address || !phone) {
      alert("Please select a delivery address and phone number");
      return;
    }

    try {
      const body = {
        items: [{ product: selected._id, quantity: Number(qty) }],
        address,
        phone,
        altPhone,
        contactEmail: email || localStorage.getItem("userEmail") || "",
        notes: notes || "",
      };

      await API.post("/orders", body);
      alert("Order placed successfully!");
      setSelected(null);
      setNotes("");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Order failed: " + err.response?.data?.msg || err.message);
    }
  };

  const lowStockProducts = products.filter((p) => p.quantity < 10);

  const filteredProducts = products.filter((p) =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (p.description &&
    p.description.toLowerCase().includes(searchTerm.toLowerCase()))
);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Low Stock Alerts Summary */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            {lowStockProducts.length} Product{lowStockProducts.length !== 1 ? "s" : ""} Low on Stock
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">
            These products have limited availability. Consider ordering soon to avoid future shortages.
          </p>
        </div>
      )}

      {/* Products Grid */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {/* Search Bar */}
        <div className="mb-5">
          <input
          type="text"
          placeholder="🔍 Search products by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
               focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               </div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Available Products</h2>

        {filteredProducts.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-600 dark:text-gray-400">
      No products found for "{searchTerm}"
    </p>
  </div>
) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Header */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {p.name}
                  </h3>
                </div>

                {/* Product Body */}
                <div className="p-4">
                  {p.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {p.description}
                    </p>
                  )}

                  {/* Price Display */}
                  {p.price !== undefined && (
                    <div className="mb-4 p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Unit Price</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{p.price.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Stock Warning */}
                  {p.quantity < 10 && (
                    <div className="mb-4">
                      <ProductStockWarning product={p} threshold={10} />
                    </div>
                  )}

                  {/* Stock Info */}
                  <div
                    className={`mb-4 p-3 rounded text-sm font-medium ${
                      p.quantity === 0
                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                        : p.quantity < 5
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                        : p.quantity < 10
                        ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                        : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    }`}
                  >
                    {p.quantity === 0
                      ? "❌ Out of Stock"
                      : p.quantity < 5
                      ? `🔴 Only ${p.quantity} left`
                      : p.quantity < 10
                      ? `⚠️ ${p.quantity} available`
                      : `✅ ${p.quantity} in stock`}
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={() => openOrder(p)}
                    disabled={p.quantity === 0}
                    className={`w-full px-4 py-2 rounded font-medium transition ${
                      p.quantity === 0
                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    }`}
                  >
                    {p.quantity === 0 ? "Out of Stock" : "Place Order"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Order {selected.name}
            </h3>

            {/* Stock Warning in Modal */}
            {selected.quantity < 10 && (
              <div className="mb-4">
                <ProductStockWarning product={selected} threshold={10} />
              </div>
            )}

            {/* Price Calculation */}
            {selected.price !== undefined && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Unit Price:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{selected.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Quantity:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{qty} units</span>
                  </div>
                  <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">Subtotal:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{(selected.price * qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Discount Section */}
                  {selected.price * qty > 3000 && (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-lg mt-3 border border-green-300 dark:border-green-700">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-green-800 dark:text-green-200">✅ 10% Discount Applied!</span>
                        <span className="text-sm text-green-700 dark:text-green-300">(Order {" > "}  ₹3000)</span>
                      </div>
                      <div className="flex justify-between text-green-800 dark:text-green-200">
                        <span>Discount Amount:</span>
                        <span className="font-bold">-₹{((selected.price * qty) * 0.1).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`border-t pt-2 mt-2 ${selected.price * qty > 3000 ? 'border-green-300 dark:border-green-700' : 'border-green-200 dark:border-green-700'}`}>
                    <div className="flex justify-between">
                      <span className="font-bold text-lg text-green-700 dark:text-green-400">Final Amount:</span>
                      <span className={`text-2xl font-bold ${selected.price * qty > 3000 ? 'text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'}`}>
                        ₹{(selected.price * qty > 3000 ? (selected.price * qty) * 0.9 : selected.price * qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  min={1}
                  max={selected.quantity}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Available: {selected.quantity} units
                </p>
              </div>

              {/* Address Selection */}
              {savedAddresses.length > 0 && !useCustomAddress ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Delivery Address
                    </label>
                    <select
                      value={selectedAddressId || ""}
                      onChange={handleAddressChange}
                      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Choose an address...</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr._id} value={addr._id}>
                          {addr.label} - {addr.address.substring(0, 30)}...
                        </option>
                      ))}
                      <option value="custom">Use Custom Address</option>
                    </select>
                  </div>

                  {selectedAddressId && savedAddresses.find((a) => a._id === selectedAddressId) && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {savedAddresses.find((a) => a._id === selectedAddressId)?.label}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {savedAddresses.find((a) => a._id === selectedAddressId)?.address}
                      </p>
                    </div>
                  )}
                </>
              ) : null}

              {(useCustomAddress || savedAddresses.length === 0) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        placeholder="Alternate phone"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contact email"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
