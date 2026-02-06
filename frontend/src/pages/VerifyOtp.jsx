import { useState } from "react";
import API from "../services/api";

export default function VerifyOtp() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await API.post("/auth/verify-otp", { email, otp });
      setMessage("OTP verified successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      setError("Invalid or expired OTP");
    }
  };

  const handleResend = async () => {
    try {
      await API.post("/auth/resend-otp", { email });
      setMessage("New OTP sent to your email");
      setError("");
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">

        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Verify OTP
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter the OTP sent to <br />
          <span className="font-medium">{email}</span>
        </p>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-green-100 text-green-600 text-sm p-2 rounded mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter 4-digit OTP"
            className="w-full border p-3 rounded mb-4 text-center tracking-widest text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={4}
            required
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Verify OTP
          </button>
        </form>

        <button
          onClick={handleResend}
          className="w-full mt-3 border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
        >
          Resend OTP
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="w-full mt-3 text-gray-500 text-sm"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
