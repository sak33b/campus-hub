import { apiFetch, API_BASE } from "../lib/api.js";
import { getToken } from "../lib/auth.js";
import { loadLayout, requireAuth } from "../lib/layout.js";
import { getPathSegment, qs } from "../lib/dom.js";
import { getAvatarUrl } from "../lib/dicebear.js";

const userId = getPathSegment(1);
const userListEl = qs("#message-user-list");
const messagesEl = qs("#message-list");
const activeNameEl = qs("#message-active-name");
const searchInput = qs("#message-search");
const draftInput = qs("#message-draft");
const form = qs("#message-form");

let users = [];
let messages = [];

if (requireAuth()) {
    loadLayout({ showSearch: false }).then(init);
}

async function init() {
    if (!userId) {
        window.location.href = "/messages";
        return;
    }
    await loadUsers();
    await loadConversation();
    bindForm();
    connectSocket();
}

async function loadUsers() {
    try {
        users = await apiFetch("/search/users");
        renderUserList();
        renderActiveHeader();
    } catch (error) {
        console.error(error);
    }
}

async function loadConversation() {
    try {
        messages = await apiFetch(`/messages/${userId}`);
        renderMessages();
    } catch (error) {
        console.error(error);
    }
}

function renderUserList(filter = "") {
    if (!userListEl) {
        return;
    }
    const keyword = filter.trim().toLowerCase();
    userListEl.innerHTML = "";
    users
        .filter((user) => {
            if (!keyword) return true;
            const name = `${user.FirstName} ${user.LastName}`.toLowerCase();
            return name.includes(keyword) || user.Username.toLowerCase().includes(keyword);
        })
        .forEach((user) => {
            const isActive = String(user.UserID) === String(userId);
            const item = document.createElement("button");
            item.type = "button";
            item.className = `w-full text-left flex items-center gap-4 p-4 border-b-2 border-ink transition-colors ${isActive ? "bg-primary text-surface" : "bg-surface hover:bg-background"
                }`;
            item.innerHTML = `
        <img
          src="${getAvatarUrl(user.Username)}"
          alt="${user.Username}'s avatar"
          class="size-12 rounded bg-background border-2 border-ink object-cover"
        />
        <div class="flex-1 min-w-0">
          <p class="text-[16px] font-bold truncate">${user.FirstName} ${user.LastName}</p>
          <p class="text-[14px] truncate ${isActive ? "text-surface/80" : "text-muted"}">@${user.Username}</p>
        </div>
      `;
            item.addEventListener("click", () => {
                window.location.href = `/messages/${user.UserID}`;
            });
            userListEl.appendChild(item);
        });
}

function renderActiveHeader() {
    if (!activeNameEl) {
        return;
    }
    const activeUser = users.find((user) => String(user.UserID) === String(userId));
    activeNameEl.textContent = activeUser ? `${activeUser.FirstName} ${activeUser.LastName}` : "";
}

function renderMessages() {
    if (!messagesEl) {
        return;
    }
    messagesEl.innerHTML = "";
    messages.forEach((message) => {
        const isMe = String(message.SenderID) !== String(userId);
        const item = document.createElement("div");
        item.className = `flex flex-col gap-1 ${isMe ? "items-end self-end" : "items-start"} max-w-[75%]`;
        item.innerHTML = `
      <div
        class="border-4 border-ink p-4 rounded text-[16px] font-medium shadow-hard ${isMe ? "bg-primary text-surface" : "bg-surface text-ink"
            }"
        style="border-bottom-left-radius: ${isMe ? "0.5rem" : "0"}; border-bottom-right-radius: ${isMe ? "0" : "0.5rem"
            };"
      >
        ${escapeHtml(message.Content)}
      </div>
      <span class="text-[13px] font-semibold text-muted">${new Date(message.Timestamp).toLocaleTimeString()}</span>
    `;
        messagesEl.appendChild(item);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function bindForm() {
    if (!form) {
        return;
    }
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const draft = draftInput?.value.trim();
        if (!draft) {
            return;
        }
        try {
            const message = await apiFetch(`/messages/${userId}`, {
                method: "POST",
                body: JSON.stringify({ content: draft }),
            });
            messages = [...messages, message];
            if (draftInput) {
                draftInput.value = "";
            }
            renderMessages();
        } catch (error) {
            console.error(error);
            alert("Please log in to send messages.");
        }
    });

    if (searchInput) {
        searchInput.addEventListener("input", () => renderUserList(searchInput.value));
    }
}

function connectSocket() {
    const token = getToken();
    if (!token) {
        return;
    }
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}${API_BASE}/messages/ws?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === "message") {
            messages = [...messages, payload.data];
            renderMessages();
        }
    };
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
