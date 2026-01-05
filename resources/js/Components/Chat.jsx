import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export default function Chat({ gameSlug, playerName = "Player", onClose }) {
    const [messages, setMessages] = useState([]);
    const [messageBody, setMessageBody] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const chatEndRef = useRef(null);

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const response = await fetch(`/games/${gameSlug}/messages`);
            if (!response.ok) throw new Error("Failed to load chat.");
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            toast.error(error.message || "Chat load failed");
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = async () => {
        if (!messageBody.trim()) return;
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
            const response = await fetch(`/games/${gameSlug}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": token,
                    Accept: "application/json",
                },
                body: JSON.stringify({ body: messageBody.trim(), sender: playerName }),
            });

            if (!response.ok) throw new Error("Failed to send message.");
            const data = await response.json();
            setMessages((prev) => [...prev, data.message]);
            setMessageBody("");
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        } catch (error) {
            toast.error(error.message || "Send failed");
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [gameSlug]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="fixed bottom-4 right-4 w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-200">
                <div className="font-semibold text-slate-800">Lobby Chat</div>
                <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>
                    ✕
                </button>
            </div>
            <div className="h-72 overflow-y-auto px-4 py-3 space-y-2 text-left bg-white">
                {loadingMessages && messages.length === 0 && (
                    <div className="text-sm text-slate-500">Loading chat...</div>
                )}
                {messages.length === 0 && !loadingMessages && (
                    <div className="text-sm text-slate-400 text-center py-8">No messages yet. Start the conversation!</div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className="rounded-xl bg-slate-100 px-3 py-2">
                        <div className="text-xs font-semibold text-slate-600">{msg.sender}</div>
                        <div className="text-sm text-slate-800 whitespace-pre-line break-words">{msg.body}</div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="border-t border-slate-200 p-3 bg-slate-50 flex gap-2">
                <input
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                    placeholder="Type a message"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <button
                    className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-200/70 hover:bg-pink-600"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
