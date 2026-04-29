"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import TopNav from "../../components/TopNav";
import { apiFetch, API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";
import useRequireAuth from "@/lib/requireAuth";

export default function MessagesPage() {
    const ready = useRequireAuth();
    const { userId } = useParams();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await apiFetch("/search/users");
                setUsers(data);
            } catch (err) {
                console.error(err);
            }
        }
        loadUsers();
    }, []);

    useEffect(() => {
        async function loadConversation() {
            try {
                const data = await apiFetch(`/messages/${userId}`);
                setMessages(data);
            } catch (err) {
                console.error(err);
            }
        }
        if (userId) {
            loadConversation();
        }
    }, [userId]);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            return undefined;
        }

        const ws = new WebSocket(`${API_BASE.replace("http", "ws")}/messages/ws?token=${token}`);
        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === "message") {
                setMessages((prev) => [...prev, payload.data]);
            }
        };
        return () => ws.close();
    }, []);

    const activeUser = useMemo(
        () => users.find((user) => String(user.UserID) === String(userId)),
        [users, userId]
    );

    async function handleSend(event) {
        event.preventDefault();
        if (!draft.trim()) {
            return;
        }
        try {
            const message = await apiFetch(`/messages/${userId}`, {
                method: "POST",
                body: JSON.stringify({ content: draft }),
            });
            setMessages((prev) => [...prev, message]);
            setDraft("");
        } catch (err) {
            console.error(err);
            alert("Please log in to send messages.");
        }
    }

    if (!ready) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <TopNav />
            <main className="flex h-[calc(100vh-72px)]">
                <aside className="w-[320px] bg-surface border-r-4 border-ink flex flex-col shrink-0">
                    <div className="p-6 border-b-4 border-ink flex flex-col gap-4 shrink-0">
                        <h1 className="text-2xl font-extrabold uppercase text-ink tracking-tight font-display">
                            Messages
                        </h1>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                search
                            </span>
                            <input
                                className="w-full h-10 pl-10 pr-4 bg-background border-2 border-ink rounded text-[15px] font-medium text-ink placeholder:text-muted focus:outline-none focus:ring-0 focus:border-primary shadow-soft"
                                placeholder="Search chats..."
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {users.map((user) => {
                            const isActive = String(user.UserID) === String(userId);
                            return (
                                <button
                                    key={user.UserID}
                                    className={`w-full text-left flex items-center gap-4 p-4 border-b-2 border-ink transition-colors ${isActive ? "bg-primary text-surface" : "bg-surface hover:bg-background"
                                        }`}
                                    onClick={() => router.push(`/messages/${user.UserID}`)}
                                >
                                    <div className="size-12 rounded bg-background border-2 border-ink flex items-center justify-center font-bold">
                                        {user.Username?.[0] || "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[16px] font-bold truncate">
                                            {user.FirstName} {user.LastName}
                                        </p>
                                        <p className={`text-[14px] truncate ${isActive ? "text-surface/80" : "text-muted"}`}>
                                            @{user.Username}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>
                <section className="flex-1 flex flex-col bg-background">
                    <header className="h-[88px] shrink-0 border-b-4 border-ink bg-surface flex items-center justify-between px-8">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded border-2 border-ink bg-background shadow-soft" />
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-extrabold uppercase text-ink tracking-tight font-display leading-none mb-1">
                                    {activeUser ? `${activeUser.FirstName} ${activeUser.LastName}` : ""}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="size-2.5 rounded-full bg-green-500 border border-ink" />
                                    <span className="text-[13px] font-semibold text-muted uppercase tracking-wider">
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                        {messages.map((message) => {
                            const isMe = String(message.SenderID) !== String(userId);
                            return (
                                <div
                                    key={message.MessageID}
                                    className={`flex flex-col gap-1 ${isMe ? "items-end self-end" : "items-start"} max-w-[75%]`}
                                >
                                    <div
                                        className={`border-4 border-ink p-4 rounded text-[16px] font-medium shadow-hard ${isMe ? "bg-primary text-surface" : "bg-surface text-ink"
                                            }`}
                                        style={{
                                            borderBottomLeftRadius: isMe ? "0.5rem" : "0",
                                            borderBottomRightRadius: isMe ? "0" : "0.5rem",
                                        }}
                                    >
                                        {message.Content}
                                    </div>
                                    <span className="text-[13px] font-semibold text-muted">
                                        {new Date(message.Timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <footer className="shrink-0 bg-surface border-t-4 border-ink p-6">
                        <form className="flex items-end gap-4 max-w-4xl mx-auto" onSubmit={handleSend}>
                            <div className="flex-1 relative">
                                <textarea
                                    className="w-full bg-background border-4 border-ink rounded p-4 pr-12 text-[16px] font-medium text-ink placeholder:text-muted focus:outline-none focus:ring-0 focus:border-primary shadow-hard resize-none min-h-[64px]"
                                    placeholder="Type a message..."
                                    rows="1"
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                />
                            </div>
                            <button className="shrink-0 h-[64px] px-8 bg-primary border-4 border-ink rounded text-surface font-bold text-[15px] uppercase tracking-wide shadow-hard btn-press flex items-center gap-2" type="submit">
                                Send
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </form>
                    </footer>
                </section>
            </main>
        </div>
    );
}
