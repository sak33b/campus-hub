import { apiFetch } from "../lib/api.js";
import { loadLayout, renderTrending, requireAuth } from "../lib/layout.js";
import { qs } from "../lib/dom.js";
import { getAvatarUrl } from "../lib/dicebear.js";

const listEl = qs("#follow-list");
const tabFollowing = qs("#tab-following");
const tabFollowers = qs("#tab-followers");
const countFollowing = qs("#count-following");
const countFollowers = qs("#count-followers");

let currentUser = null;
let following = [];
let followers = [];
let activeTab = "following";

if (requireAuth()) {
    loadLayout({ activeNav: "/following" }).then(init);
}

async function init() {
    try {
        currentUser = await apiFetch("/users/me");
        const [followingData, followersData] = await Promise.all([
            apiFetch(`/users/${currentUser.user_id}/following`),
            apiFetch(`/users/${currentUser.user_id}/followers`),
        ]);
        following = followingData || [];
        followers = followersData || [];
        renderTrending([]);
        bindEvents();
        renderTabs();
        renderList();
    } catch (error) {
        console.error(error);
    }
}

function bindEvents() {
    if (tabFollowing) {
        tabFollowing.addEventListener("click", () => setActiveTab("following"));
    }
    if (tabFollowers) {
        tabFollowers.addEventListener("click", () => setActiveTab("followers"));
    }
}

function setActiveTab(tab) {
    activeTab = tab;
    renderTabs();
    renderList();
}

function renderTabs() {
    if (countFollowing) {
        countFollowing.textContent = `(${following.length})`;
    }
    if (countFollowers) {
        countFollowers.textContent = `(${followers.length})`;
    }

    if (tabFollowing) {
        tabFollowing.classList.toggle("text-primary", activeTab === "following");
        tabFollowing.classList.toggle("text-muted", activeTab !== "following");
        tabFollowing.classList.toggle("border-primary", activeTab === "following");
        tabFollowing.classList.toggle("border-b-4", activeTab === "following");
    }
    if (tabFollowers) {
        tabFollowers.classList.toggle("text-primary", activeTab === "followers");
        tabFollowers.classList.toggle("text-muted", activeTab !== "followers");
        tabFollowers.classList.toggle("border-primary", activeTab === "followers");
        tabFollowers.classList.toggle("border-b-4", activeTab === "followers");
    }
}

function renderList() {
    if (!listEl) {
        return;
    }
    const data = activeTab === "following" ? following : followers;
    listEl.innerHTML = "";

    if (!data.length) {
        const empty = document.createElement("div");
        empty.className = "bg-surface border-thick rounded shadow-hard p-6 text-center text-muted font-semibold";
        empty.textContent = activeTab === "following" ? "No following yet." : "No followers yet.";
        listEl.appendChild(empty);
        return;
    }

    data.forEach((user) => {
        const card = document.createElement("a");
        card.href = `/profile/${user.UserID}`;
        card.className = "bg-surface border-thick rounded shadow-hard p-4 flex items-center gap-4 justify-between";
        card.innerHTML = `
      <div class="flex items-center gap-4">
        <img
          src="${getAvatarUrl(user.Username)}"
          alt="${user.Username}'s avatar"
          class="size-12 rounded-full border-thick object-cover bg-background"
        />
        <div>
          <div class="font-bold text-lg">${user.FirstName} ${user.LastName}</div>
          <div class="text-muted text-sm">@${user.Username}</div>
        </div>
      </div>
      <span class="text-xs font-bold uppercase text-muted">View Profile</span>
    `;
        listEl.appendChild(card);
    });
}
