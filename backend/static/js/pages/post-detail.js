import { apiFetch, getApiErrorMessage } from "../lib/api.js";
import { loadLayout, renderTrending } from "../lib/layout.js";
import { clearToken, getToken } from "../lib/auth.js";
import { buildPostCard } from "../lib/post-card.js";
import { getPathSegment, qs } from "../lib/dom.js";
import { getAvatarUrl } from "../lib/dicebear.js";

const postId = getPathSegment(1);
const postCardEl = qs("#post-card");
const commentForm = qs("#comment-form");
const commentInput = qs("#comment-content");
const commentList = qs("#comment-list");

let post = null;
let comments = [];
let currentUserId = null;
let activeReplyId = null;
let replyDraft = "";

loadLayout().then(init);

async function init() {
    await loadData();
    renderTrending([]);
    renderPost();
    renderComments();
    bindEvents();
}

async function loadData() {
    try {
        const [postsData, commentsData] = await Promise.all([
            apiFetch("/posts?sort=new"),
            apiFetch(`/comments/posts/${postId}`),
        ]);
        post = postsData.find((item) => String(item.post_id) === String(postId)) || null;
        comments = commentsData;
    } catch (error) {
        console.error(error);
    }

    if (!getToken()) {
        currentUserId = null;
        return;
    }

    try {
        const meData = await apiFetch("/users/me");
        currentUserId = meData.user_id;
    } catch (error) {
        const message = getApiErrorMessage(error);
        if (
            message.includes("Could not validate credentials") ||
            message.includes("Not authenticated")
        ) {
            clearToken();
        }
        currentUserId = null;
    }
}

function renderPost() {
    if (!postCardEl || !post) {
        return;
    }
    postCardEl.innerHTML = "";
    const card = buildPostCard({
        post,
        currentUserId,
        onVote: handleVote,
        onDelete: handleDeletePost,
    });
    postCardEl.appendChild(card);
}

function bindEvents() {
    if (commentForm) {
        commentForm.addEventListener("submit", handleCommentSubmit);
    }
}

function buildThread(items) {
    const byId = new Map();
    items.forEach((comment) => byId.set(comment.comment_id, { ...comment, replies: [] }));

    const roots = [];
    byId.forEach((comment) => {
        if (comment.parent_id && byId.has(comment.parent_id)) {
            byId.get(comment.parent_id).replies.push(comment);
        } else {
            roots.push(comment);
        }
    });

    return roots;
}

function renderComments() {
    if (!commentList) {
        return;
    }
    commentList.innerHTML = "";
    const threaded = buildThread(comments);
    threaded.forEach((comment) => {
        commentList.appendChild(renderComment(comment, 0));
    });
}

function renderComment(comment, depth) {
    const wrapper = document.createElement("div");
    wrapper.className = `flex gap-3 py-4 border-b-2 border-ink ${depth > 0 ? "ml-6" : ""}`;
    const canReply = Boolean(currentUserId);
    wrapper.innerHTML = `
    <div class="flex flex-col items-center gap-1 shrink-0 mt-1">
      <img
        src="${getAvatarUrl(comment.username)}"
        alt="${comment.username}'s avatar"
        class="size-8 rounded-full border-thick bg-background object-cover"
      />
    </div>
    <div class="flex flex-col gap-2 flex-1">
      <div class="flex items-center gap-2">
        <span class="font-bold text-sm">@${comment.username}</span>
        <span class="text-xs text-muted font-semibold">• ${new Date(comment.timestamp).toLocaleString()}</span>
      </div>
      <p class="font-medium text-base">${escapeHtml(comment.content)}</p>
      <div class="flex items-center gap-4 mt-1">
                <button class="text-xs font-bold uppercase text-muted" data-reply type="button">
                    ${canReply ? "Reply" : "Login to reply"}
                </button>
        ${currentUserId === comment.user_id ? "<button class=\"text-xs font-bold uppercase text-red-700\" data-delete type=\"button\">Delete</button>" : ""}
      </div>
      <div data-reply-form></div>
      <div data-replies></div>
    </div>
  `;

    const replyButton = wrapper.querySelector("[data-reply]");
    if (replyButton) {
        replyButton.addEventListener("click", () => {
            if (!canReply) {
                window.location.href = "/login";
                return;
            }
            activeReplyId = comment.comment_id;
            replyDraft = "";
            renderComments();
        });
    }

    const deleteBtn = wrapper.querySelector("[data-delete]");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => handleDeleteComment(comment.comment_id));
    }

    const replyFormContainer = wrapper.querySelector("[data-reply-form]");
    if (replyFormContainer && activeReplyId === comment.comment_id) {
        replyFormContainer.innerHTML = `
      <form class="border-thick rounded p-3 bg-background flex flex-col gap-2" data-reply-form-inner>
        <textarea
          class="w-full bg-transparent border-thick rounded p-3 min-h-[80px]"
          placeholder="Write a reply..."
        >${escapeHtml(replyDraft)}</textarea>
        <div class="flex justify-end gap-3">
          <button class="text-xs font-bold uppercase text-muted" type="button" data-cancel>Cancel</button>
          <button class="bg-primary text-surface border-thick rounded px-4 py-2 text-xs font-bold uppercase shadow-hard btn-press" type="submit">Reply</button>
        </div>
      </form>
    `;

        const form = replyFormContainer.querySelector("[data-reply-form-inner]");
        const textarea = replyFormContainer.querySelector("textarea");
        const cancel = replyFormContainer.querySelector("[data-cancel]");

        if (textarea) {
            textarea.addEventListener("input", (event) => {
                replyDraft = event.target.value;
            });
        }
        if (cancel) {
            cancel.addEventListener("click", () => {
                activeReplyId = null;
                replyDraft = "";
                renderComments();
            });
        }
        if (form) {
            form.addEventListener("submit", (event) => handleReplySubmit(event, comment.comment_id));
        }
    }

    const replyContainer = wrapper.querySelector("[data-replies]");
    comment.replies.forEach((reply) => {
        replyContainer.appendChild(renderComment(reply, depth + 1));
    });

    return wrapper;
}

async function handleCommentSubmit(event) {
    event.preventDefault();
    const content = commentInput?.value.trim();
    if (!content) {
        return;
    }
    if (!getToken()) {
        window.location.href = "/login";
        return;
    }
    try {
        const newComment = await apiFetch(`/comments/posts/${postId}`, {
            method: "POST",
            body: JSON.stringify({ content }),
        });
        comments = [...comments, newComment];
        if (commentInput) {
            commentInput.value = "";
        }
        renderComments();
    } catch (error) {
        console.error(error);
        if (!handleAuthError(error, "comment")) {
            alert("Unable to comment right now.");
        }
    }
}

async function handleReplySubmit(event, commentId) {
    event.preventDefault();
    if (!replyDraft.trim()) {
        return;
    }
    if (!getToken()) {
        window.location.href = "/login";
        return;
    }
    try {
        const reply = await apiFetch(`/comments/${commentId}/replies`, {
            method: "POST",
            body: JSON.stringify({ content: replyDraft.trim() }),
        });
        comments = [...comments, reply];
        activeReplyId = null;
        replyDraft = "";
        renderComments();
    } catch (error) {
        console.error(error);
        if (!handleAuthError(error, "reply")) {
            alert("Unable to reply right now.");
        }
    }
}

async function handleDeleteComment(commentId) {
    try {
        await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
        comments = comments.filter((item) => item.comment_id !== commentId);
        renderComments();
    } catch (error) {
        console.error(error);
        alert("Unable to delete comment.");
    }
}

function handleAuthError(error, action) {
    const message = getApiErrorMessage(error);
    if (
        message.includes("Could not validate credentials") ||
        message.includes("Not authenticated")
    ) {
        clearToken();
        alert(`Please log in to ${action}.`);
        window.location.href = "/login";
        return true;
    }
    return false;
}

function applyVoteUpdate(currentPost, voteType) {
    const currentVote = currentPost.user_vote;
    let nextVote = voteType;
    let score = currentPost.vote_score;

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

    return { ...currentPost, user_vote: nextVote, vote_score: score };
}

async function handleVote(postId, voteType) {
    if (!post) {
        return;
    }
    const previous = post;
    post = applyVoteUpdate(post, voteType);
    renderPost();

    try {
        if (previous.user_vote === voteType) {
            await apiFetch(`/votes/posts/${postId}`, { method: "DELETE" });
        } else {
            await apiFetch(`/votes/posts/${postId}`, {
                method: "POST",
                body: JSON.stringify({ vote_type: voteType }),
            });
        }
    } catch (error) {
        console.error(error);
        post = previous;
        renderPost();
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

async function handleDeletePost() {
    if (!post) {
        return;
    }
    try {
        await apiFetch(`/posts/${post.post_id}`, { method: "DELETE" });
        window.location.href = "/";
    } catch (error) {
        console.error(error);
        alert("Unable to delete post.");
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
