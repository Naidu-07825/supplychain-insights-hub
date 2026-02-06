import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../services/socket";

export default function HospitalChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (!user?.token) return;

    // 🔌 connect socket
    connectSocket(user.token);
    const socket = getSocket();

    /* =========================
       🤖 LISTEN FIRST
    ========================= */
    socket.on("CHAT_BOT_REPLY", (data) => {
      console.log("📩 Bot message received:", data);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message: data.message,
          quickReplies: data.quickReplies || [],
        },
      ]);
    });

    setSocketReady(true);

    /* =========================
       🧹 CLEANUP
    ========================= */
    return () => {
      socket.off("CHAT_BOT_REPLY");
    };
  }, [user?.token]);

  /* =========================
     🤖 REQUEST GREETING (ONCE)
  ========================= */
  useEffect(() => {
    if (!socketReady) return;

    const socket = getSocket();
    socket.emit("REQUEST_GREETING");
  }, [socketReady]);

  /* =========================
     ⚡ QUICK REPLY CLICK
  ========================= */
  const handleQuickReply = (reply) => {
    const socket = getSocket();

    // show user message instantly
    setMessages((prev) => [
      ...prev,
      { sender: "user", message: reply.label },
    ]);

    socket.emit("QUICK_REPLY_CLICK", {
      replyId: reply.id,
      replyLabel: reply.label,
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-white w-full max-w-md">
      <h2 className="font-bold mb-3 text-lg">Hospital Chat</h2>

      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={`text-sm ${
                m.sender === "bot"
                  ? "text-gray-700"
                  : "text-blue-700 text-right"
              }`}
            >
              {m.sender === "bot" ? "🤖" : "🧑"} {m.message}
            </div>

            {/* ⚡ QUICK REPLIES */}
            {m.quickReplies?.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {m.quickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    onClick={() => handleQuickReply(qr)}
                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-full"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}