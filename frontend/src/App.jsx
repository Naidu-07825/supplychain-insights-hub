  import { useEffect, useState } from "react";
  import Home from "./pages/Home";
  import Login from "./pages/Login";
  import Register from "./pages/Register";
  import VerifyOtp from "./pages/VerifyOtp";
  import HospitalDashboard from "./pages/HospitalDashboard";
  import AdminDashboard from "./pages/AdminDashboard";
  import MyOrders from "./pages/MyOrders";
  import AdminOrders from "./pages/AdminOrders";
  import AdminProducts from "./pages/AdminProducts";

  const path = window.location.pathname;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  export default function App() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }, [theme]);

    if (path === "/login") return <Login />;
    if (path === "/register") return <Register />;

    // ✅ THIS WAS MISSING
    if (path === "/verify-otp") return <VerifyOtp />;

    if (path === "/dashboard") {
      if (!token) return <Login />;

      if (role === "admin") return <AdminDashboard />;
      if (role === "hospital") return <HospitalDashboard />;
    }

    if (path === "/my-orders") {
      if (!token) return <Login />;
      return <MyOrders />;
    }

    if (path === "/admin/orders") {
      if (!token) return <Login />;
      if (role !== "admin") return <Login />;
      return <AdminOrders />;
    }

    if (path === "/admin/products") {
      if (!token) return <Login />;
      if (role !== "admin") return <Login />;
      return <AdminProducts />;
    }

    return <Home />;
  }
