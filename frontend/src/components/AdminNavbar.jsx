import ThemeToggle from "./ThemeToggle";

export default function AdminNavbar() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">SupplyChain Insights Hub</h2>
      <div className="flex gap-3 items-center">
        <ThemeToggle />
        <button onClick={() => (window.location.href = '/admin/orders')} className="bg-blue-400 px-3 py-2 rounded">Orders</button>
        <button onClick={() => (window.location.href = '/admin/products')} className="bg-blue-400 px-3 py-2 rounded">Products</button>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
