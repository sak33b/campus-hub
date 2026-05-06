import { apiFetch, getApiErrorMessage } from "../lib/api.js";
import { loadLayout, renderTrending } from "../lib/layout.js";
import { clearToken, getToken } from "../lib/auth.js";
import { buildPostCard } from "../lib/post-card.js";
import { qs } from "../lib/dom.js";

let posts = [];
let sort = "hot";
let currentUserId = null;

const postsEl = qs("#feed-posts");
const createForm = qs("#create-post-form");
const contentInput = qs("#create-post-content");
const sortHot = qs("#sort-hot");
const sortNew = qs("#sort-new");
const sortTop = qs("#sort-top");

loadLayout({ activeNav: "/", showTrending: false }).then(init);

async function init() {
    bindSortButtons();
    await loadCurrentUser();
    await loadFeed();
}

async function loadCurrentUser() {
    if (!getToken()) {
        currentUserId = null;
        return;
    }
    try {
        const me = await apiFetch("/users/me");
        currentUserId = me.user_id;
    } catch (error) {
        const message = getApiErrorMessage(error);
        if (
            message.includes("Could not validate credentials") ||
            message.includes("Not authenticated")
        ) {
            clearToken();
        } else {
            console.error(error);
        }
        currentUserId = null;
    }
}

async function loadFeed() {
    try {
        const [postsData, trendingData] = await Promise.all([
            apiFetch(`/posts?sort=${sort}`),
            apiFetch("/trending"),
        ]);
        posts = postsData;
        renderTrending(trendingData);
        renderPosts();
    } catch (error) {
        console.error(error);
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
            currentUserId,
            onVote: handleVote,
            onDelete: handleDelete,
        });
        postsEl.appendChild(card);
    });
}

function bindSortButtons() {
    if (sortHot) {
        sortHot.addEventListener("click", () => setSort("hot"));
    }
    if (sortNew) {
        sortNew.addEventListener("click", () => setSort("new"));
    }
    if (sortTop) {
        sortTop.addEventListener("click", () => setSort("top"));
    }

    if (createForm) {
        createForm.addEventListener("submit", handleCreatePost);
    }
}

function setSort(nextSort) {
    if (sort === nextSort) {
        return;
    }
    sort = nextSort;
    updateSortButtons();
    loadFeed();
}

function updateSortButtons() {
    const map = [
        { btn: sortHot, id: "hot" },
        { btn: sortNew, id: "new" },
        { btn: sortTop, id: "top" },
    ];
    map.forEach(({ btn, id }) => {
        if (!btn) {
            return;
        }
        if (sort === id) {
            btn.classList.add("text-primary", "border-b-4", "border-primary");
            btn.classList.remove("text-muted");
        } else {
            btn.classList.remove("text-primary", "border-b-4", "border-primary");
            btn.classList.add("text-muted");
        }
    });
}

async function handleCreatePost(event) {
    event.preventDefault();
    const content = contentInput?.value.trim();
    if (!content) {
        return;
    }
    if (!getToken()) {
        window.location.href = "/login";
        return;
    }
    try {
        const newPost = await apiFetch("/posts", {
            method: "POST",
            body: JSON.stringify({ content, visibility_level: "public" }),
        });
        posts = [newPost, ...posts];
        if (contentInput) {
            contentInput.value = "";
        }
        renderPosts();
    } catch (error) {
        console.error(error);
        const message = getApiErrorMessage(error);
        if (
            message.includes("Could not validate credentials") ||
            message.includes("Not authenticated")
        ) {
            clearToken();
            window.location.href = "/login";
            return;
        }
        alert("Unable to post right now.");
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
