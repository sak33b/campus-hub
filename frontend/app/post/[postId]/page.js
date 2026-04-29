"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import LeftNav from "../../components/LeftNav";
import RightSidebar from "../../components/RightSidebar";
import TopNav from "../../components/TopNav";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import useRequireAuth from "@/lib/requireAuth";

function buildThread(comments) {
    const byId = new Map();
    comments.forEach((comment) => byId.set(comment.comment_id, { ...comment, replies: [] }));

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

function CommentBlock({
    comment,
    depth = 0,
    currentUserId,
    activeReplyId,
    replyDraft,
    onReplyClick,
    onReplyChange,
    onReplySubmit,
    onReplyCancel,
    onDeleteComment,
}) {
    return (
        <div className={`flex gap-3 py-4 border-b-2 border-ink ${depth > 0 ? "ml-6" : ""}`}>
            <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                <div className="size-8 rounded-full border-thick bg-background" />
            </div>
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">@{comment.username}</span>
                    <span className="text-xs text-muted font-semibold">
                        • {new Date(comment.timestamp).toLocaleString()}
                    </span>
                </div>
                <p className="font-medium text-base">{comment.content}</p>
                <div className="flex items-center gap-4 mt-1">
                    <button
                        className="text-xs font-bold uppercase text-muted"
                        type="button"
                        onClick={() => onReplyClick(comment.comment_id)}
                    >
                        Reply
                    </button>
                    {currentUserId === comment.user_id ? (
                        <button
                            className="text-xs font-bold uppercase text-red-700"
                            type="button"
                            onClick={() => onDeleteComment(comment.comment_id)}
                        >
                            Delete
                        </button>
                    ) : null}
                </div>
                {activeReplyId === comment.comment_id ? (
                    <form
                        className="border-thick rounded p-3 bg-background flex flex-col gap-2"
                        onSubmit={(event) => onReplySubmit(event, comment.comment_id)}
                    >
                        <textarea
                            className="w-full bg-transparent border-thick rounded p-3 min-h-[80px]"
                            placeholder="Write a reply..."
                            value={replyDraft}
                            onChange={(event) => onReplyChange(event.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                className="text-xs font-bold uppercase text-muted"
                                type="button"
                                onClick={onReplyCancel}
                            >
                                Cancel
                            </button>
                            <button className="bg-primary text-surface border-thick rounded px-4 py-2 text-xs font-bold uppercase shadow-hard btn-press">
                                Reply
                            </button>
                        </div>
                    </form>
                ) : null}
                {comment.replies.map((reply) => (
                    <CommentBlock
                        key={reply.comment_id}
                        comment={reply}
                        depth={depth + 1}
                        currentUserId={currentUserId}
                        activeReplyId={activeReplyId}
                        replyDraft={replyDraft}
                        onReplyClick={onReplyClick}
                        onReplyChange={onReplyChange}
                        onReplySubmit={onReplySubmit}
                        onReplyCancel={onReplyCancel}
                        onDeleteComment={onDeleteComment}
                    />
                ))}
            </div>
        </div>
    );
}

export default function PostDetailPage() {
    const ready = useRequireAuth();
    const { postId } = useParams();
    const router = useRouter();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [reply, setReply] = useState("");
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyDraft, setReplyDraft] = useState("");

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

    async function handleVote(voteType) {
        if (!post) {
            return;
        }
        const previous = post;
        const updated = applyVoteUpdate(post, voteType);
        setPost(updated);

        try {
            if (previous.user_vote === voteType) {
                await apiFetch(`/votes/posts/${postId}`, { method: "DELETE" });
            } else {
                await apiFetch(`/votes/posts/${postId}`, {
                    method: "POST",
                    body: JSON.stringify({ vote_type: voteType }),
                });
            }
        } catch (err) {
            console.error(err);
            setPost(previous);
            const message = getApiErrorMessage(err);
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

    useEffect(() => {
        async function loadData() {
            try {
                const [postsData, commentsData, meData] = await Promise.all([
                    apiFetch("/posts?sort=new"),
                    apiFetch(`/comments/posts/${postId}`),
                    apiFetch("/users/me"),
                ]);
                const found = postsData.find((item) => String(item.post_id) === String(postId));
                setPost(found || null);
                setComments(commentsData);
                setCurrentUserId(meData.user_id);
            } catch (err) {
                console.error(err);
            }
        }
        loadData();
    }, [postId]);

    const threaded = useMemo(() => buildThread(comments), [comments]);

    async function handleCommentSubmit(event) {
        event.preventDefault();
        if (!reply.trim()) {
            return;
        }
        try {
            const newComment = await apiFetch(`/comments/posts/${postId}`, {
                method: "POST",
                body: JSON.stringify({ content: reply }),
            });
            setComments((prev) => [...prev, newComment]);
            setReply("");
        } catch (err) {
            console.error(err);
            alert("Please log in to comment.");
        }
    }

    async function handleReplySubmit(event, commentId) {
        event.preventDefault();
        if (!replyDraft.trim()) {
            return;
        }
        try {
            const newReply = await apiFetch(`/comments/${commentId}/replies`, {
                method: "POST",
                body: JSON.stringify({ content: replyDraft }),
            });
            setComments((prev) => [...prev, newReply]);
            setReplyDraft("");
            setActiveReplyId(null);
        } catch (err) {
            console.error(err);
            alert("Please log in to reply.");
        }
    }

    async function handleDeleteComment(commentId) {
        try {
            await apiFetch(`/comments/${commentId}`, { method: "DELETE" });
            setComments((prev) => prev.filter((comment) => comment.comment_id !== commentId));
        } catch (err) {
            console.error(err);
            alert("Unable to delete comment.");
        }
    }

    async function handleDeletePost() {
        try {
            await apiFetch(`/posts/${postId}`, { method: "DELETE" });
            router.push("/");
        } catch (err) {
            console.error(err);
            alert("Unable to delete post.");
        }
    }

    if (!ready) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <TopNav />
            <div className="flex-1 max-w-[1200px] w-full mx-auto flex gap-6 px-4 py-6">
                <LeftNav active="/" />
                <main className="flex-1 max-w-[600px] flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 bg-surface rounded border-thick shadow-soft flex items-center justify-center"
                            onClick={() => router.push("/")}
                            type="button"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </button>
                        <span className="font-bold text-sm uppercase tracking-wider text-muted">
                            Back to Feed
                        </span>
                    </div>
                    {post ? (
                        <article className="bg-surface rounded border-thick shadow-hard flex">
                            <div className="w-12 shrink-0 bg-background border-r-4 border-ink flex flex-col items-center py-4 gap-2">
                                <button
                                    className={post.user_vote === "upvote" ? "text-accent" : "text-muted hover:text-accent"}
                                    onClick={() => handleVote("upvote")}
                                    type="button"
                                >
                                    <span
                                        className="material-symbols-outlined text-3xl"
                                        style={post.user_vote === "upvote" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        keyboard_arrow_up
                                    </span>
                                </button>
                                <span className="font-bold text-lg text-accent">{post.vote_score}</span>
                                <button
                                    className={post.user_vote === "downvote" ? "text-ink" : "text-muted hover:text-primary"}
                                    onClick={() => handleVote("downvote")}
                                    type="button"
                                >
                                    <span
                                        className="material-symbols-outlined text-3xl"
                                        style={post.user_vote === "downvote" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                    >
                                        keyboard_arrow_down
                                    </span>
                                </button>
                            </div>
                            <div className="p-5 flex flex-col gap-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full border-thick bg-background" />
                                    <div>
                                        <p className="font-bold text-sm">@{post.username}</p>
                                        <p className="text-xs text-muted font-semibold tracking-wide">
                                            {new Date(post.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-extrabold uppercase leading-tight">
                                    {post.content.slice(0, 80)}
                                </h2>
                                <div className="text-[18px] font-medium leading-relaxed text-ink whitespace-pre-wrap">
                                    {post.content}
                                </div>
                                {currentUserId && post.user_id === currentUserId ? (
                                    <div>
                                        <button
                                            className="flex items-center gap-1.5 font-bold text-[13px] uppercase text-red-700 bg-background border-2 border-ink px-3 py-1.5 rounded shadow-soft hover:bg-surface"
                                            onClick={handleDeletePost}
                                            type="button"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                            Delete Post
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </article>
                    ) : (
                        <div className="text-muted font-bold">Post not found.</div>
                    )}
                    <section className="flex flex-col gap-0">
                        {threaded.map((comment) => (
                            <CommentBlock
                                key={comment.comment_id}
                                comment={comment}
                                currentUserId={currentUserId}
                                activeReplyId={activeReplyId}
                                replyDraft={replyDraft}
                                onReplyClick={(commentId) => {
                                    setActiveReplyId(commentId);
                                    setReplyDraft("");
                                }}
                                onReplyChange={setReplyDraft}
                                onReplySubmit={handleReplySubmit}
                                onReplyCancel={() => {
                                    setActiveReplyId(null);
                                    setReplyDraft("");
                                }}
                                onDeleteComment={handleDeleteComment}
                            />
                        ))}
                    </section>
                    <form
                        onSubmit={handleCommentSubmit}
                        className="bg-surface border-thick shadow-hard rounded p-3 flex gap-3 items-start"
                    >
                        <div className="size-10 rounded-full border-thick bg-background" />
                        <div className="flex-1 flex items-center bg-background border-thick rounded h-[56px] px-3">
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium"
                                placeholder="Add a comment to the thread..."
                                value={reply}
                                onChange={(event) => setReply(event.target.value)}
                            />
                            <button className="ml-2 text-primary font-bold uppercase text-sm">Post</button>
                        </div>
                    </form>
                </main>
                <RightSidebar trending={[]} />
            </div>
        </div>
    );
}
