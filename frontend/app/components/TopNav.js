"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

export default function TopNav({ showSearch = true }) {
    const router = useRouter();
    const [hasToken, setHasToken] = useState(() => Boolean(getToken()));
    const [me, setMe] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadMe() {
            if (!getToken()) {
                setMe(null);
                return;
            }
            try {
                const data = await apiFetch("/users/me");
                setMe(data);
            } catch (error) {
                console.error(error);
                setMe(null);
            }
        }
        loadMe();
    }, []);

    function handleSearchSubmit(event) {
        event.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
            params.set("query", searchQuery.trim());
        }
        const queryString = params.toString();
        router.push(queryString ? `/search?${queryString}` : "/search");
    }

    async function handleLogout() {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } catch (error) {
            console.error(error);
        }
        clearToken();
        setHasToken(false);
        router.push("/login");
    }

    return (
        <header className="h-[72px] bg-surface border-b-4 border-ink flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4 text-ink w-[240px]">
                <div className="size-8 bg-primary rounded border-2 border-ink flex items-center justify-center text-surface font-bold text-xl leading-none">
                    C
                </div>
                <Link
                    href="/"
                    className="text-2xl font-extrabold uppercase tracking-tight font-display"
                >
                    CampusHub
                </Link>
            </div>
            {showSearch ? (
                <div className="flex-1 max-w-[600px] px-4">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex w-full items-center border-thick rounded bg-surface h-12 shadow-soft"
                    >
                        <div className="px-3 text-ink flex items-center">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="w-full h-full bg-transparent border-none focus:ring-0 text-ink font-medium placeholder:text-muted"
                            placeholder="Search the yard..."
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </form>
                </div>
            ) : (
                <div className="flex-1" />
            )}
            <div className="flex items-center gap-4 w-[240px] justify-end">
                <Link
                    href="/notifications"
                    className="relative size-12 bg-surface border-thick rounded flex items-center justify-center text-ink shadow-hard btn-press"
                >
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute -top-2 -right-2 size-4 bg-accent border-2 border-ink rounded-full" />
                </Link>
                {hasToken ? (
                    <>
                        <button
                            className="bg-surface border-thick rounded px-4 py-2 font-bold uppercase shadow-soft btn-press"
                            onClick={handleLogout}
                            type="button"
                        >
                            Logout
                        </button>
                        <Link
                            href={me ? `/profile/${me.user_id}` : "/"}
                            className="size-12 bg-primary border-thick rounded bg-cover bg-center shadow-soft"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDoz_uOVYbWmzjakOfL_stYYDaweI8tvUgqhRIvaWGTfdE69tgzHHaio5UFGaMon1S7mfISBOVuq-r4q_qlPRzZCN_76eF6DJIa8tFmKOLre3521eszVCHQsQ4v_NVI0M74F_8ZZ8ESyHe0Ppxik5mHQUwLknakrtJM9ukh1sXX8njbF-IvT2BAGW-KlHrk6yIUXXXeeos6a8PCMJ_oGEpaGM-K-b2iRKTum8eRn6k3Ief1R_VYLmryl9GreXIMkruXtEaX5deD3ylH')",
                            }}
                        />
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            className="bg-surface border-thick rounded px-4 py-2 font-bold uppercase shadow-soft btn-press"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="bg-primary text-surface border-thick rounded px-4 py-2 font-bold uppercase shadow-hard btn-press"
                        >
                            Join
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
