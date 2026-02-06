import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    try {
      const res = await API.get("/contacts");
      console.log("Fetched contacts:", res.data);
      setContacts(res.data);
    } catch (err) {
      console.error("Fetch contacts error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/contacts/${id}`, { status });
      fetchContacts();
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await API.delete(`/contacts/${id}`);
      fetchContacts();
      setSelectedContact(null);
      alert("Contact deleted successfully");
    } catch (err) {
      console.error("Delete contact error:", err);
      alert("Failed to delete contact");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">📬 Contact Messages</h2>

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No contact messages yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-1 border rounded-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="font-bold mb-3">Messages ({contacts.length})</h3>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedContact?._id === contact._id
                      ? "bg-blue-100 border-l-4 border-blue-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-semibold text-sm">{contact.name}</div>
                  <div className="text-xs text-gray-600 truncate">{contact.subject}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      contact.status === "New" ? "bg-yellow-100 text-yellow-800" :
                      contact.status === "Read" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          {selectedContact ? (
            <div className="lg:col-span-2 border rounded-lg p-6 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg">{selectedContact.name}</h4>
                  <p className="text-gray-600 text-sm">{selectedContact.email}</p>
                  {selectedContact.phone && (
                    <p className="text-gray-600 text-sm">📞 {selectedContact.phone}</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded border">
                  <h5 className="font-bold mb-2">Subject:</h5>
                  <p className="text-gray-700">{selectedContact.subject}</p>
                </div>

                <div className="bg-white p-4 rounded border">
                  <h5 className="font-bold mb-2">Message:</h5>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>

                <div className="text-sm text-gray-500">
                  <p>
                    Received:{" "}
                    <span className="font-semibold">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>

                {/* Status Update */}
                <div className="bg-white p-4 rounded border">
                  <label className="font-bold text-sm block mb-2">Update Status:</label>
                  <div className="flex gap-2 flex-wrap">
                    {["New", "Read", "Replied"].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedContact._id, status)}
                        className={`px-3 py-1 rounded text-sm font-semibold transition ${
                          selectedContact.status === status
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteContact(selectedContact._id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
                >
                  🗑️ Delete Message
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center border rounded-lg p-6 bg-gray-50">
              <p className="text-gray-500">Select a message to view details</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
