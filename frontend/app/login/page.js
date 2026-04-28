"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    async function handleLogin() {
        const response = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!data.access_token) {
            console.log("failed login")
        } else {
            localStorage.setItem("token", data.access_token)
            router.push("/")
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 flex flex-col gap-4">
            <input
                value={email}
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
            />
            <input
                value={password}
                placeholder="password"
                type="password"
                onChange={(p) => setPassword(p.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
            />
            <button onClick={() => handleLogin()}>Login</button>

            <button onClick={() => router.push("/register")}>Register</button>
        </div>
    )
}