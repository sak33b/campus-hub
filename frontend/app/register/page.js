"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Register() {

    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")


    async function handleRegistration() {
        const response = await fetch("http://localhost:8000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        })

        if (response.ok) {
            router.push("/login")
        } else {
            console.log("failed registration");

        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 flex flex-col gap-4">
            <input
                value={username}
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
            />
            <input
                value={email}
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
            />
            <input
                value={password}
                type="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
            />
            <button onClick={() => handleRegistration()}>Register</button>
        </div>
    )
}