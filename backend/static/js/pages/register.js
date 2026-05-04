import { apiFetch } from "../lib/api.js";
import { setToken } from "../lib/auth.js";
import { qs } from "../lib/dom.js";

const form = qs("#register-form");
const fullName = qs("#register-fullname");
const email = qs("#register-email");
const deptSelect = qs("#register-dept");
const password = qs("#register-password");
const errorEl = qs("#register-error");

async function loadDepartments() {
    try {
        const data = await apiFetch("/departments");
        data.forEach((dept) => {
            const option = document.createElement("option");
            option.value = dept.DeptID;
            option.textContent = dept.DeptName;
            deptSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

if (deptSelect) {
    loadDepartments();
}

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (errorEl) {
            errorEl.classList.add("hidden");
            errorEl.textContent = "";
        }

        try {
            const payload = {
                full_name: fullName.value.trim(),
                email: email.value.trim(),
                password: password.value,
                dept_id: deptSelect.value ? Number(deptSelect.value) : null,
            };
            const data = await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            setToken(data.access_token);
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            if (errorEl) {
                errorEl.textContent = "Registration failed. Try another email.";
                errorEl.classList.remove("hidden");
            }
        }
    });
}
