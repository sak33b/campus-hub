"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import LeftNav from "../../components/LeftNav";
import RightSidebar from "../../components/RightSidebar";
import TopNav from "../../components/TopNav";
import PostCard from "../../components/PostCard";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import useRequireAuth from "@/lib/requireAuth";

export default function ProfilePage() {
    const ready = useRequireAuth();
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowBusy, setIsFollowBusy] = useState(false);
    const [formState, setFormState] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        dept_id: "",
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const [userData, postsData] = await Promise.all([
                    apiFetch(`/users/${userId}`),
                    apiFetch(`/posts?user_id=${userId}&sort=new`),
                ]);
                setUser(userData);
                setFormState({
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    bio: userData.bio || "",
                    dept_id: userData.dept_id || "",
                });
                setPosts(postsData);
            } catch (err) {
                console.error(err);
            }
        }
        loadProfile();
    }, [userId]);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const data = await apiFetch("/users/me");
                setCurrentUser(data);
            } catch (err) {
                setCurrentUser(null);
            }
        }

        async function loadDepartments() {
            try {
                const data = await apiFetch("/departments");
                setDepartments(data);
            } catch (err) {
                console.error(err);
            }
        }

        loadCurrentUser();
        loadDepartments();
    }, []);

    useEffect(() => {
        async function loadFollowStatus() {
            if (!user || !currentUser || currentUser.user_id === user.user_id) {
                setIsFollowing(false);
                return;
            }
            try {
                const data = await apiFetch(`/follows/users/${user.user_id}/status`);
                setIsFollowing(Boolean(data.is_following));
            } catch (err) {
                console.error(err);
            }
        }

        loadFollowStatus();
    }, [user, currentUser]);

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
        const prevPosts = posts;
        setPosts((items) =>
            items.map((post) =>
                post.post_id === postId ? applyVoteUpdate(post, voteType) : post
            )
        );

        const target = prevPosts.find((post) => post.post_id === postId);
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
        } catch (err) {
            console.error(err);
            setPosts(prevPosts);
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

    async function handleSave(event) {
        event.preventDefault();
        try {
            const payload = {
                first_name: formState.first_name,
                last_name: formState.last_name,
                bio: formState.bio,
                dept_id: formState.dept_id ? Number(formState.dept_id) : null,
            };
            const updated = await apiFetch("/users/me", {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
            setUser(updated);
            setCurrentUser(updated);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Please log in to update your profile.");
        }
    }

    async function handleFollowToggle() {
        if (!user) {
            return;
        }
        setIsFollowBusy(true);
        try {
            if (isFollowing) {
                await apiFetch(`/follows/users/${user.user_id}`, { method: "DELETE" });
                setIsFollowing(false);
            } else {
                await apiFetch(`/follows/users/${user.user_id}`, { method: "POST" });
                setIsFollowing(true);
            }
        } catch (err) {
            console.error(err);
            alert("Please log in to follow.");
        } finally {
            setIsFollowBusy(false);
        }
    }

    async function handleDeletePost(postId) {
        try {
            await apiFetch(`/posts/${postId}`, { method: "DELETE" });
            setPosts((items) => items.filter((post) => post.post_id !== postId));
        } catch (err) {
            console.error(err);
            alert("Unable to delete post.");
        }
    }

    const isMe = currentUser && user && currentUser.user_id === user.user_id;

    if (!ready) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <TopNav />
            <div className="max-w-[1140px] mx-auto w-full flex-1 grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)_300px] gap-8 py-8 px-4">
                <LeftNav active="/" />
                <main className="flex flex-col gap-6 w-full">
                    {user ? (
                        <div className="bg-surface border-thick rounded shadow-hard overflow-hidden flex flex-col relative">
                            <div className="h-[160px] w-full" style={{
                                background:
                                    "repeating-linear-gradient(45deg, #0033A0, #0033A0 20px, #FFC72C 20px, #FFC72C 40px)",
                            }} />
                            <div className="px-6 pb-6 pt-16 relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                <div className="absolute -top-12 left-6">
                                    <div className="h-24 w-24 rounded-full border-4 border-surface overflow-visible bg-surface relative">
                                        <div className="absolute inset-[-4px] rounded-full border-4 border-ink" />
                                        <div className="h-full w-full rounded-full bg-background" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 w-full pt-2">
                                    <h1 className="font-extrabold text-3xl uppercase tracking-tight text-ink leading-none">
                                        {user.first_name} {user.last_name}
                                    </h1>
                                    <p className="font-semibold text-muted text-base tracking-wide">
                                        @{user.username}
                                    </p>
                                </div>
                                {isMe ? (
                                    <button
                                        className="bg-surface text-primary border-2 border-ink font-bold uppercase px-8 py-3 rounded shadow-hard btn-press shrink-0 w-full sm:w-auto"
                                        onClick={() => setIsEditing((prev) => !prev)}
                                        type="button"
                                    >
                                        {isEditing ? "Cancel" : "Edit Profile"}
                                    </button>
                                ) : (
                                    <button
                                        className="bg-surface text-primary border-2 border-ink font-bold uppercase px-8 py-3 rounded shadow-hard btn-press shrink-0 w-full sm:w-auto"
                                        onClick={handleFollowToggle}
                                        type="button"
                                        disabled={isFollowBusy}
                                    >
                                        {isFollowBusy
                                            ? "Working..."
                                            : isFollowing
                                                ? "Following"
                                                : "Follow"}
                                    </button>
                                )}
                            </div>
                            <div className="flex border-t-4 border-ink divide-x-4 divide-ink bg-background">
                                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                                    <span className="font-extrabold text-2xl text-ink">{posts.length}</span>
                                    <span className="font-semibold text-muted text-sm uppercase tracking-wide">
                                        Posts
                                    </span>
                                </div>
                                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                                    <span className="font-extrabold text-2xl text-ink">
                                        {user.dept_name || "N/A"}
                                    </span>
                                    <span className="font-semibold text-muted text-sm uppercase tracking-wide">
                                        Department
                                    </span>
                                </div>
                                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                                    <span className="font-extrabold text-2xl text-ink">Bio</span>
                                    <span className="font-semibold text-muted text-sm uppercase tracking-wide">
                                        {user.bio || "No bio yet"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted font-bold">Loading profile...</div>
                    )}
                    {isMe && isEditing ? (
                        <form
                            onSubmit={handleSave}
                            className="bg-surface border-thick rounded shadow-hard p-6 flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-bold uppercase text-xs">First name</label>
                                    <input
                                        className="w-full border-thick rounded p-3 mt-2"
                                        value={formState.first_name}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                first_name: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="font-bold uppercase text-xs">Last name</label>
                                    <input
                                        className="w-full border-thick rounded p-3 mt-2"
                                        value={formState.last_name}
                                        onChange={(event) =>
                                            setFormState((prev) => ({
                                                ...prev,
                                                last_name: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold uppercase text-xs">Bio</label>
                                <textarea
                                    className="w-full border-thick rounded p-3 mt-2 min-h-[100px]"
                                    value={formState.bio}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            bio: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="font-bold uppercase text-xs">Department</label>
                                <select
                                    className="w-full border-thick rounded p-3 mt-2"
                                    value={formState.dept_id}
                                    onChange={(event) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            dept_id: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.DeptID} value={dept.DeptID}>
                                            {dept.DeptName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end">
                                <button className="bg-primary text-surface border-thick rounded px-6 py-2 font-bold uppercase shadow-hard btn-press">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : null}
                    <div className="flex gap-8 border-b-4 border-ink mt-4">
                        <span className="pb-3 px-2 font-bold uppercase text-lg text-primary border-b-4 border-primary">
                            Posts
                        </span>
                        <span className="pb-3 px-2 font-bold uppercase text-lg text-muted">
                            Comments
                        </span>
                    </div>
                    <div className="flex flex-col gap-6">
                        {posts.map((post) => (
                            <PostCard
                                key={post.post_id}
                                postId={post.post_id}
                                userId={post.user_id}
                                currentUserId={currentUser?.user_id}
                                content={post.content}
                                author={post.username}
                                timestamp={new Date(post.timestamp).toLocaleDateString()}
                                votes={post.vote_score}
                                comments={post.comment_count}
                                userVote={post.user_vote}
                                onVote={handleVote}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                </main>
                <RightSidebar trending={[]} />
            </div>
        </div>
    );
}
