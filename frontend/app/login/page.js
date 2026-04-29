"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(event) {
        event.preventDefault();
        setError("");

        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            setToken(data.access_token);
            router.push("/");
        } catch (err) {
            console.error(err);
            setError("Invalid email or password.");
        }
    }

    return (
        <main className="bg-background min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent border-thick shadow-hard -z-10 transform rotate-12" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary border-thick shadow-hard -z-10 transform -rotate-6" />
                <div className="bg-surface border-thick shadow-hard p-8 flex flex-col gap-8">
                    <div className="text-center">
                        <h1 className="font-display text-2xl uppercase italic tracking-tight mb-2 text-primary">
                            CampusHub
                        </h1>
                        <p className="font-medium text-muted">
                            Enter the yard. Connect with your campus.
                        </p>
                    </div>
                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2 relative">
                            <label className="font-bold text-xs uppercase pl-1">
                                University Email
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                                    school
                                </span>
                                <input
                                    className="w-full pl-12 pr-4 py-4 bg-surface border-thick shadow-soft font-medium text-ink placeholder:text-muted focus:outline-none focus:bg-accent/30"
                                    placeholder="you@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end pl-1">
                                <label className="font-bold text-xs uppercase">Password</label>
                                <span className="text-xs font-bold text-primary">Forgot?</span>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                                    key
                                </span>
                                <input
                                    className="w-full pl-12 pr-4 py-4 bg-surface border-thick shadow-soft font-medium text-ink placeholder:text-muted focus:outline-none focus:bg-accent/30"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {error ? (
                            <div className="text-sm font-bold text-red-600">{error}</div>
                        ) : null}
                        <button
                            className="mt-2 w-full bg-primary text-surface border-thick py-4 shadow-hard btn-press flex justify-center items-center gap-2 uppercase font-bold"
                            type="submit"
                        >
                            Log In
                            <span className="material-symbols-outlined">login</span>
                        </button>
                    </form>
                    <div className="mt-2 pt-6 border-t-4 border-muted text-center">
                        <p className="font-medium text-muted">New to the campus?</p>
                        <button
                            className="inline-block mt-2 font-bold text-ink bg-accent px-6 py-3 border-thick shadow-soft btn-press uppercase"
                            onClick={() => router.push("/register")}
                        >
                            Join the Yard
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}