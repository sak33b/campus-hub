import { apiFetch } from "../lib/api.js";
import { loadLayout, renderTrending } from "../lib/layout.js";
import { qs } from "../lib/dom.js";
import { getAvatarUrl } from "../lib/dicebear.js";

const queryInput = qs("#search-query");
const deptInput = qs("#search-department");
const resultsEl = qs("#search-results");
let timerId = null;

loadLayout({ activeNav: "/search" }).then(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query") || "";
    if (queryInput) {
        queryInput.value = query;
    }
    runSearch();
});

if (queryInput) {
    queryInput.addEventListener("input", handleSearchInput);
}
if (deptInput) {
    deptInput.addEventListener("input", handleSearchInput);
}

async function handleSearchInput() {
    if (timerId) {
        window.clearTimeout(timerId);
    }
    timerId = window.setTimeout(runSearch, 250);
}

async function runSearch() {
    try {
        const query = queryInput ? queryInput.value.trim() : "";
        const department = deptInput ? deptInput.value.trim() : "";
        const data = await apiFetch(
            `/search/users?query=${encodeURIComponent(query)}&department=${encodeURIComponent(department)}`
        );
        renderTrending([]);
        renderResults(data);
    } catch (error) {
        console.error(error);
    }
}

function renderResults(users) {
    if (!resultsEl) {
        return;
    }
    resultsEl.innerHTML = "";
    users.forEach((user) => {
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
      <div class="text-xs font-bold uppercase text-muted">${user.DeptName || ""}</div>
    `;
        resultsEl.appendChild(card);
    });
}
