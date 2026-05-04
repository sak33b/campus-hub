import { apiFetch } from "../lib/api.js";
import { setToken } from "../lib/auth.js";
import { qs } from "../lib/dom.js";

const form = qs("#login-form");
const emailInput = qs("#login-email");
const passwordInput = qs("#login-password");
const errorEl = qs("#login-error");

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (errorEl) {
            errorEl.classList.add("hidden");
            errorEl.textContent = "";
        }

        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value,
                }),
            });
            setToken(data.access_token);
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            if (errorEl) {
                errorEl.textContent = "Invalid email or password.";
                errorEl.classList.remove("hidden");
            }
        }
    });
}
