import ThemeToggle from "./ThemeToggle";

export default function Navbar({ title }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <h1 className="text-xl font-bold text-blue-600">
        {title}
      </h1>
      <div className="flex gap-3">
        <ThemeToggle />
        <button onClick={()=> (window.location.href = '/my-orders')} className="px-3 py-2 border rounded">My Orders</button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
