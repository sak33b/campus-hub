import { apiFetch, getApiErrorMessage } from "../lib/api.js";
import { loadLayout, renderTrending, requireAuth } from "../lib/layout.js";
import { buildPostCard } from "../lib/post-card.js";
import { getPathSegment, qs } from "../lib/dom.js";
import { getAvatarUrl } from "../lib/dicebear.js";

const userId = getPathSegment(1);
const nameEl = qs("#profile-name");
const usernameEl = qs("#profile-username");
const deptEl = qs("#profile-dept");
const bioEl = qs("#profile-bio");
const avatarEl = qs("#profile-avatar");
const followBtn = qs("#profile-follow");
const messageBtn = qs("#profile-message");
const editBtn = qs("#profile-edit");
const karmaEl = qs("#profile-stat-karma");
const classEl = qs("#profile-stat-class");
const majorEl = qs("#profile-stat-major");
const editWrap = qs("#profile-edit-form");
const form = qs("#profile-form");
const firstNameInput = qs("#profile-first-name");
const lastNameInput = qs("#profile-last-name");
const bioInput = qs("#profile-bio-input");
const deptSelect = qs("#profile-dept-input");
const cancelBtn = qs("#profile-cancel");
const postsEl = qs("#profile-posts");

let posts = [];
let user = null;
let currentUser = null;
let departments = [];
let isEditing = false;
let isFollowing = false;
let isFollowBusy = false;

if (requireAuth()) {
    loadLayout({ activeNav: "/profile" }).then(init);
}

async function init() {
    await Promise.all([loadProfile(), loadCurrentUser(), loadDepartments()]);
    await loadFollowStatus();
    renderTrending([]);
    renderProfile();
    renderPosts();
    bindEvents();
}

async function loadProfile() {
    try {
        const [userData, postsData] = await Promise.all([
            apiFetch(`/users/${userId}`),
            apiFetch(`/posts?user_id=${userId}&sort=new`),
        ]);
        user = userData;
        posts = postsData;
    } catch (error) {
        console.error(error);
    }
}

async function loadCurrentUser() {
    try {
        currentUser = await apiFetch("/users/me");
    } catch (error) {
        currentUser = null;
    }
}

async function loadDepartments() {
    try {
        departments = await apiFetch("/departments");
    } catch (error) {
        console.error(error);
    }
}

async function loadFollowStatus() {
    if (!user || !currentUser || user.user_id === currentUser.user_id) {
        isFollowing = false;
        return;
    }
    try {
        const data = await apiFetch(`/follows/users/${user.user_id}/status`);
        isFollowing = Boolean(data.is_following);
    } catch (error) {
        console.error(error);
    }
}

function renderProfile() {
    if (!user) {
        return;
    }
    if (nameEl) {
        nameEl.textContent = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    if (usernameEl) {
        usernameEl.textContent = `@${user.username}`;
    }
    // Set DiceBear avatar
    if (avatarEl) {
        avatarEl.src = getAvatarUrl(user.username);
        avatarEl.alt = `${user.username}'s avatar`;
    }
    if (deptEl) {
        deptEl.textContent = user.dept_name ? user.dept_name : "";
    }
    if (bioEl) {
        bioEl.textContent = user.bio || "";
    }

    if (karmaEl) {
        const karma = posts.reduce((total, post) => total + (post.vote_score ?? 0), 0);
        karmaEl.textContent = formatCompactNumber(karma);
    }
    if (classEl) {
        classEl.textContent = "—";
    }
    if (majorEl) {
        majorEl.textContent = user.dept_name ? getMajorLabel(user.dept_name) : "—";
    }

    const isMe = currentUser && user && currentUser.user_id === user.user_id;
    if (followBtn) {
        followBtn.classList.toggle("hidden", isMe);
        followBtn.textContent = isFollowing ? "Following" : "Follow";
    }
    if (messageBtn) {
        if (isMe) {
            messageBtn.style.display = "none";
        } else {
            messageBtn.style.display = "flex";
            messageBtn.href = `/messages/${user.user_id}`;
        }
    }
    if (editBtn) {
        editBtn.classList.toggle("hidden", !isMe);
    }

    if (firstNameInput) firstNameInput.value = user.first_name || "";
    if (lastNameInput) lastNameInput.value = user.last_name || "";
    if (bioInput) bioInput.value = user.bio || "";
    if (deptSelect) {
        deptSelect.innerHTML = "<option value=\"\">Select Department</option>";
        departments.forEach((dept) => {
            const option = document.createElement("option");
            option.value = dept.DeptID;
            option.textContent = dept.DeptName;
            if (String(dept.DeptID) === String(user.dept_id)) {
                option.selected = true;
            }
            deptSelect.appendChild(option);
        });
    }
}

function renderPosts() {
    if (!postsEl) {
        return;
    }
    postsEl.innerHTML = "";
    posts.forEach((post) => {
        const card = buildPostCard({
            post,
            currentUserId: currentUser?.user_id,
            onVote: handleVote,
            onDelete: handleDelete,
        });
        postsEl.appendChild(card);
    });
}

function bindEvents() {
    if (followBtn) {
        followBtn.addEventListener("click", handleFollowToggle);
    }
    if (editBtn) {
        editBtn.addEventListener("click", () => toggleEdit(true));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => toggleEdit(false));
    }
    if (form) {
        form.addEventListener("submit", handleSave);
    }
}

function toggleEdit(next) {
    isEditing = next;
    if (editWrap) {
        editWrap.classList.toggle("hidden", !isEditing);
    }
}

async function handleSave(event) {
    event.preventDefault();
    try {
        const payload = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            bio: bioInput.value.trim(),
            dept_id: deptSelect.value ? Number(deptSelect.value) : null,
        };
        const updated = await apiFetch("/users/me", {
            method: "PATCH",
            body: JSON.stringify(payload),
        });
        user = updated;
        currentUser = updated;
        toggleEdit(false);
        renderProfile();
    } catch (error) {
        console.error(error);
        alert("Please log in to update your profile.");
    }
}

async function handleFollowToggle() {
    if (!user || isFollowBusy) {
        return;
    }
    isFollowBusy = true;
    try {
        if (isFollowing) {
            await apiFetch(`/follows/users/${user.user_id}`, { method: "DELETE" });
            isFollowing = false;
        } else {
            await apiFetch(`/follows/users/${user.user_id}`, { method: "POST" });
            isFollowing = true;
        }
        renderProfile();
    } catch (error) {
        console.error(error);
        alert("Please log in to follow.");
    } finally {
        isFollowBusy = false;
    }
}

function applyVoteUpdate(post, voteType) {
    const currentVote = post.user_vote;
    let nextVote = voteType;
    let score = post.vote_score;

    if (currentVote === voteType) {
        nextVote = null;
        score += voteType === "upvote" ? -1 : 1;
    } else if (!currentVote) {
        score += voteType === "upvote" ? 1 : -1;
    } else if (currentVote === "upvote" && voteType === "downvote") {
        score -= 2;
    } else if (currentVote === "downvote" && voteType === "upvote") {
        score += 2;
    }

    return { ...post, user_vote: nextVote, vote_score: score };
}

async function handleVote(postId, voteType) {
    const previous = posts;
    posts = posts.map((post) =>
        post.post_id === postId ? applyVoteUpdate(post, voteType) : post
    );
    renderPosts();

    const target = previous.find((post) => post.post_id === postId);
    const currentVote = target?.user_vote;
    try {
        if (currentVote === voteType) {
            await apiFetch(`/votes/posts/${postId}`, { method: "DELETE" });
        } else {
            await apiFetch(`/votes/posts/${postId}`, {
                method: "POST",
                body: JSON.stringify({ vote_type: voteType }),
            });
        }
    } catch (error) {
        console.error(error);
        posts = previous;
        renderPosts();
        const message = getApiErrorMessage(error);
        if (message.includes("Post not found")) {
            alert("This post no longer exists.");
        } else if (
            message.includes("Could not validate credentials") ||
            message.includes("Not authenticated")
        ) {
            alert("Please log in to vote.");
        } else {
            alert("Unable to apply vote right now.");
        }
    }
}

async function handleDelete(postId) {
    try {
        await apiFetch(`/posts/${postId}`, { method: "DELETE" });
        posts = posts.filter((post) => post.post_id !== postId);
        renderPosts();
    } catch (error) {
        console.error(error);
        alert("Unable to delete post.");
    }
}

function formatCompactNumber(value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "0";
    }
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

function getMajorLabel(name) {
    const trimmed = name.trim();
    if (!trimmed) {
        return "—";
    }
    if (trimmed.length <= 6) {
        return trimmed;
    }
    return trimmed
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}
