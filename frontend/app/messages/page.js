"use client";

import Link from "next/link";

import LeftNav from "../components/LeftNav";
import TopNav from "../components/TopNav";
import useRequireAuth from "@/lib/requireAuth";

export default function MessagesIndexPage() {
    const ready = useRequireAuth();

    if (!ready) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <TopNav />
            <main className="max-w-[1200px] mx-auto flex gap-6 pt-8 px-4 items-start pb-20">
                <LeftNav active="/messages" />
                <div className="w-[600px] shrink-0 bg-surface border-thick rounded shadow-hard p-8">
                    <h1 className="font-extrabold text-3xl uppercase text-ink mb-4">Messages</h1>
                    <p className="font-medium text-muted mb-6">
                        Open a profile and start a direct conversation from there.
                    </p>
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 bg-primary text-surface border-thick rounded px-5 py-3 font-bold uppercase shadow-hard btn-press"
                    >
                        <span className="material-symbols-outlined">person_search</span>
                        Find People
                    </Link>
                </div>
            </main>
        </div>
    );
}
