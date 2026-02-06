import { useEffect, useState } from "react";
import API from "../services/api";

export default function Home() {
  const [stats, setStats] = useState({
    hospitals: 0,
    supplies: 0,
    alerts: 0,
  });

  // simple counter animation
  useEffect(() => {
    let h = 0,
      s = 0,
      a = 0;

    const interval = setInterval(() => {
      if (h < 20) h += 4;
      if (s < 45) s += 150;
      if (a < 99) a += 3;

      setStats({
        hospitals: h,
        supplies: s,
        alerts: a,
      });

      if (h >= 120 && s >= 4500 && a >= 98) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
<nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
  <h1 className="text-xl font-bold text-blue-600">
    SupplyChain Insights Hub
  </h1>

  <div className="flex items-center gap-3">
    {/* Hospital Login */}
    <a
      href="/login"
      className="bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700"
    >
      Hospital Login
    </a>

    {/* Admin Login */}
    <a
      href="/login"
      className="border border-blue-600 text-blue-600 px-4 py-2 rounded transition hover:bg-blue-50"
    >
      Admin Login
    </a>

    {/* Register */}
    <a
      href="/register"
      className="border border-gray-400 text-gray-600 px-4 py-2 rounded transition hover:bg-gray-100"
    >
      Register
    </a>
  </div>
</nav>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <h2 className="text-4xl font-bold mb-4">
          Smarter Healthcare Supply Management
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          A centralized platform to monitor hospital inventory, prevent
          shortages, and gain real-time insights across healthcare networks.
        </p>

        <a
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg transition hover:bg-blue-700"
        >
          Get Started
        </a>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-20">
        <StatCard
          title="Hospitals Connected"
          value={stats.hospitals}
          suffix="+"
        />
        <StatCard
          title="Medical Supplies Tracked"
          value={stats.supplies}
          suffix="+"
        />
        <StatCard
          title="Shortages Prevented"
          value={stats.alerts}
          suffix="%"
        />
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-8">
        <h3 className="text-2xl font-bold text-center mb-10">
          Platform Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            title="📦 Inventory Tracking"
            desc="Monitor stock levels of critical medical supplies in real time."
          />
          <Feature
            title="🚨 Smart Alerts"
            desc="Get notified before inventory reaches critical levels."
          />
          <Feature
            title="📊 Analytics Dashboard"
            desc="Analyze usage trends and supplier performance."
          />
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-10">Get In Touch</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Form */}
            <ContactForm />
            
            {/* Office Info & Map */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded shadow">
                <h4 className="font-bold text-lg mb-4">📍 Our Office</h4>
                <p className="text-gray-600 mb-2"><b>SupplyChain Insights Hub</b></p>
                <p className="text-gray-600 mb-4">
                  Kommadi, Visakapatnam<br />
                  Andhra Pradesh, India
                </p>
                <a
                  href="https://maps.google.com/?q=Kommadi,Visakapatnam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                  📍 Open in Maps
                </a>
              </div>

              {/* Embedded Map */}
              <div className="bg-white p-4 rounded shadow overflow-hidden">
                <iframe
                  title="Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3829.5489577844545!2d83.14999!3d17.76667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395bf4f5555555%3A0x1234567890ab!2sKommadi%2C%20Visakapatnam%2C%20Andhra%20Pradesh%20530060!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Footer */}
<footer className="bg-white border-t mt-10">
  <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
    
    <div>
      <h4 className="font-bold text-gray-800 mb-2">
        SupplyChain Insights Hub
      </h4>
      <p>
        Smart healthcare supply chain monitoring and analytics platform.
      </p>
    </div>

    <div>
      <h4 className="font-bold text-gray-800 mb-2">Address</h4>
      <p>
        Kommadi, Visakapatnam, Andhra Pradesh<br />
        India
      </p>
    </div>

    <div>
      <h4 className="font-bold text-gray-800 mb-2">Contact</h4>
      <p>Email: dasukoteswarnaidu0gmail.com</p>
    </div>
  </div>

  <div className="text-center text-xs text-gray-500 py-4 border-t">
    © {new Date().getFullYear()} SupplyChain Insights Hub. All rights reserved.
  </div>
</footer>
    </div>
  );
}

/* Components */

function StatCard({ title, value, suffix }) {
  return (
    <div className="bg-white p-8 rounded shadow text-center transition transform hover:-translate-y-1">
      <h4 className="text-3xl font-bold text-blue-600 mb-2">
        {value}
        {suffix}
      </h4>
      <p className="text-gray-600">{title}</p>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-gray-50 p-6 rounded shadow hover:shadow-md transition">
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm();
  };

  const submitForm = async () => {
    try {
      const res = await API.post("/contacts", formData);
      console.log("Form submitted:", res.data);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      alert("Failed to submit form: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <h4 className="font-bold text-lg mb-4">💬 Contact Us</h4>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-600"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-600"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          Subject
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="How can we help?"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-600"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">
          Message
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your message..."
          rows="4"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-600"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
      >
        Send Message
      </button>

      {submitted && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded text-sm">
          ✓ Thank you! We'll get back to you soon.
        </div>
      )}
    </form>
  );
}
