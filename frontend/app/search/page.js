"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import LeftNav from "../components/LeftNav";
import RightSidebar from "../components/RightSidebar";
import TopNav from "../components/TopNav";
import { apiFetch } from "@/lib/api";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("query") || "");
    const [department, setDepartment] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        async function runSearch() {
            try {
                const data = await apiFetch(
                    `/search/users?query=${encodeURIComponent(query)}&department=${encodeURIComponent(department)}`
                );
                setResults(data);
            } catch (err) {
                console.error(err);
            }
        }
        runSearch();
    }, [query, department]);

    return (
        <div className="min-h-screen">
            <TopNav />
            <main className="max-w-[1200px] mx-auto flex gap-6 pt-8 px-4 items-start pb-20">
                <LeftNav active="/search" />
                <div className="w-[600px] shrink-0 flex flex-col gap-6">
                    <div className="bg-surface border-thick rounded shadow-hard p-4 flex flex-col gap-4">
                        <div>
                            <label className="font-bold uppercase text-xs">Search by name</label>
                            <input
                                className="w-full border-thick rounded p-3 mt-2"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search users..."
                            />
                        </div>
                        <div>
                            <label className="font-bold uppercase text-xs">Department</label>
                            <input
                                className="w-full border-thick rounded p-3 mt-2"
                                value={department}
                                onChange={(event) => setDepartment(event.target.value)}
                                placeholder="Computer Science"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        {results.map((user) => (
                            <Link
                                key={user.UserID}
                                href={`/profile/${user.UserID}`}
                                className="bg-surface border-thick rounded shadow-hard p-4 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-bold text-lg">
                                        {user.FirstName} {user.LastName}
                                    </div>
                                    <div className="text-muted text-sm">@{user.Username}</div>
                                </div>
                                <div className="text-xs font-bold uppercase text-muted">
                                    {user.DeptName || ""}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                <RightSidebar trending={[]} />
            </main>
        </div>
    );
}
