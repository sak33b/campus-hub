"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function Register() {
    const router = useRouter();
    const [departments, setDepartments] = useState([]);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [deptId, setDeptId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDepartments() {
            try {
                const data = await apiFetch("/departments");
                setDepartments(data);
            } catch (err) {
                console.error(err);
            }
        }
        loadDepartments();
    }, []);

    async function handleRegistration(event) {
        event.preventDefault();
        setError("");

        try {
            const payload = {
                full_name: fullName,
                email,
                password,
                dept_id: deptId ? Number(deptId) : null,
            };
            const data = await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            setToken(data.access_token);
            router.push("/");
        } catch (err) {
            console.error(err);
            setError("Registration failed. Try another email.");
        }
    }

    return (
        <main className="bg-background min-h-screen flex flex-col md:flex-row antialiased">
            <div className="w-full md:w-2/5 lg:w-1/3 bg-primary border-thick md:border-r-4 md:border-b-0 border-b-4 border-l-0 border-t-0 p-8 flex flex-col justify-between relative overflow-hidden">
                <span className="material-symbols-outlined absolute -right-20 -top-20 text-[300px] text-primary/40 rotate-12 pointer-events-none">
                    campaign
                </span>
                <div className="relative z-10">
                    <div className="font-display text-surface text-3xl uppercase italic tracking-tighter mb-16">
                        CampusHub
                    </div>
                    <h1 className="font-display text-surface text-5xl md:text-6xl uppercase leading-none mb-8">
                        Join
                        <br />
                        The
                        <br />
                        Roster.
                    </h1>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-primary/90 p-4 border-thick shadow-soft transform -rotate-1">
                            <span className="material-symbols-outlined text-accent text-3xl">forum</span>
                            <span className="font-bold text-surface uppercase">Unfiltered Chatter</span>
                        </div>
                        <div className="flex items-center gap-4 bg-primary/90 p-4 border-thick shadow-soft transform rotate-1 ml-4">
                            <span className="material-symbols-outlined text-accent text-3xl">bolt</span>
                            <span className="font-bold text-surface uppercase">Real-Time Updates</span>
                        </div>
                        <div className="flex items-center gap-4 bg-primary/90 p-4 border-thick shadow-soft transform -rotate-2">
                            <span className="material-symbols-outlined text-accent text-3xl">
                                local_fire_department
                            </span>
                            <span className="font-bold text-surface uppercase">Exclusive Drops</span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 mt-16 pt-8 border-t-4 border-surface/40">
                    <p className="font-bold text-surface uppercase">
                        Already verified?{" "}
                        <button
                            className="text-accent underline decoration-4 underline-offset-4"
                            onClick={() => router.push("/login")}
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
            <div className="w-full md:w-3/5 lg:w-2/3 flex items-center justify-center p-6 md:p-12 relative">
                <div className="absolute inset-0 z-0 opacity-10" style={{
                    backgroundImage: "radial-gradient(#1a1b22 2px, transparent 2px)",
                    backgroundSize: "24px 24px",
                }} />
                <div className="w-full max-w-xl bg-surface border-thick shadow-hard p-8 md:p-10 relative z-10">
                    <div className="mb-10 flex justify-between items-end border-b-4 border-ink pb-4">
                        <div>
                            <h2 className="font-display text-4xl uppercase text-ink">Claim Your Spot</h2>
                            <p className="font-medium text-muted mt-2">Step 1 of 1: Basic Info</p>
                        </div>
                        <div className="font-display text-5xl text-muted">01</div>
                    </div>
                    <form onSubmit={handleRegistration} className="space-y-6">
                        <div>
                            <label className="block font-bold text-ink uppercase mb-2">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                                    person
                                </span>
                                <input
                                    className="w-full bg-surface border-thick p-4 pl-12 font-medium text-ink placeholder:text-muted focus:outline-none"
                                    placeholder="Jordan Doe"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block font-bold text-ink uppercase mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                                    mail
                                </span>
                                <input
                                    className="w-full bg-surface border-thick p-4 pl-12 font-medium text-ink placeholder:text-muted focus:outline-none"
                                    placeholder="jordan@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block font-bold text-ink uppercase mb-2">Department</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-surface border-thick p-4 font-medium text-ink appearance-none focus:outline-none"
                                    value={deptId}
                                    onChange={(event) => setDeptId(event.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.DeptID} value={dept.DeptID}>
                                            {dept.DeptName}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-ink pointer-events-none">
                                    arrow_drop_down
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block font-bold text-ink uppercase mb-2">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                                    lock
                                </span>
                                <input
                                    className="w-full bg-surface border-thick p-4 pl-12 font-medium text-ink placeholder:text-muted focus:outline-none"
                                    placeholder="Create a strong password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {error ? <div className="text-sm font-bold text-red-600">{error}</div> : null}
                        <div className="pt-6 mt-6 border-t-4 border-ink border-dashed">
                            <button className="w-full bg-accent text-ink font-display text-2xl uppercase py-5 px-8 border-thick shadow-hard btn-press flex justify-center items-center gap-3" type="submit">
                                Continue to the Yard
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}