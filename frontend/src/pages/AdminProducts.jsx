import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", quantity: 0, price: 0 });
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      console.log("Fetched products:", res.data);
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch products error:", err.response?.data || err.message);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ name: "", description: "", quantity: 0, price: 0 }); setShowForm(true); };

  const openEdit = (p) => { setEditingId(p._id); setForm({ name: p.name, description: p.description || "", quantity: p.quantity, price: p.price || 0 }); setShowForm(true); };

  const submit = async () => {
    try {
      console.log("Submitting form:", form);
      if (editingId) {
        await API.put(`/products/${editingId}`, form);
      } else {
        const res = await API.post(`/products`, form);
        console.log("Product created:", res.data);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) { 
      console.error("Submit error:", err.response?.data || err.message); 
      alert('Failed: ' + (err.response?.data?.message || err.message)); 
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete product?')) return;
    try { await API.delete(`/products/${id}`); fetchProducts(); } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
      <div className="mb-4">
        <button onClick={openCreate} className="px-3 py-2 bg-green-600 text-white rounded">Add Product</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(p => (
          <div key={p._id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
                <div className="mt-2">Stock: <b>{p.quantity}</b></div>
                <div className="mt-1">Price: <b>₹{p.price?.toFixed(2) || "N/A"}</b></div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>openEdit(p)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                <button onClick={()=>remove(p._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-xl font-bold mb-3">{editingId ? 'Edit' : 'Add'} Product</h3>
            <label className="text-sm">Name</label>
            <input className="w-full border p-2 mb-3" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            <label className="text-sm">Description</label>
            <textarea className="w-full border p-2 mb-3" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} />
            <label className="text-sm">Quantity</label>
            <input type="number" className="w-full border p-2 mb-3" value={form.quantity} onChange={(e)=>setForm({...form, quantity: Number(e.target.value)})} />
            
            <label className="text-sm">Price (₹)</label>
            <input type="number" step="0.01" className="w-full border p-2 mb-3" value={form.price} onChange={(e)=>setForm({...form, price: Number(e.target.value)})} />

            <div className="flex justify-end gap-3">
              <button onClick={()=>setShowForm(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={submit} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
