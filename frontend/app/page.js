"use client";

import { useEffect, useState } from "react";

import LeftNav from "./components/LeftNav";
import PostCard from "./components/PostCard";
import RightSidebar from "./components/RightSidebar";
import TopNav from "./components/TopNav";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import useRequireAuth from "@/lib/requireAuth";

export default function Home() {
  const ready = useRequireAuth();
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [content, setContent] = useState("");
  const [sort, setSort] = useState("hot");
  const [currentUserId, setCurrentUserId] = useState(null);

  async function fetchFeed() {
    const [postsData, trendingData] = await Promise.all([
      apiFetch(`/posts?sort=${sort}`),
      apiFetch("/trending"),
    ]);
    setPosts(postsData);
    setTrending(trendingData);
  }

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const me = await apiFetch("/users/me");
        setCurrentUserId(me.user_id);
      } catch (error) {
        console.error(error);
        setCurrentUserId(null);
      }
    }

    async function loadFeed() {
      try {
        await loadCurrentUser();
        await fetchFeed();
      } catch (error) {
        console.error(error);
      }
    }
    if (ready) {
      loadFeed();
    }
  }, [sort, ready]);

  async function handleDeletePost(postId) {
    try {
      await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      setPosts((items) => items.filter((post) => post.post_id !== postId));
    } catch (error) {
      console.error(error);
      alert("Unable to delete post.");
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
    } catch (error) {
      console.error(error);
      setPosts(prevPosts);
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

  async function handleCreatePost(event) {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    try {
      const newPost = await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({ content, visibility_level: "public" }),
      });
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
    } catch (error) {
      console.error(error);
      alert("Please log in to post.");
    }
  }

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-[1200px] mx-auto flex gap-6 pt-8 px-4 items-start pb-20">
        <LeftNav active="/" />
        <div className="w-[600px] shrink-0 flex flex-col gap-6">
          <div className="bg-surface border-thick rounded shadow-hard p-4">
            <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start a thread..."
                className="w-full min-h-[100px] border-thick rounded p-3 text-ink placeholder:text-muted focus:outline-none"
              />
              <div className="flex justify-end">
                <button className="bg-primary text-surface border-thick rounded px-6 py-2 font-bold uppercase shadow-hard btn-press">
                  Post
                </button>
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4 pb-2 border-b-4 border-ink">
            <button
              className={`font-bold text-lg uppercase flex items-center gap-1 pb-1 -mb-[6px] ${sort === "hot"
                ? "text-primary border-b-4 border-primary"
                : "text-muted"
                }`}
              onClick={() => setSort("hot")}
            >
              <span className="material-symbols-outlined">local_fire_department</span>
              Hot
            </button>
            <button
              className={`font-bold text-lg uppercase flex items-center gap-1 pb-1 ${sort === "new" ? "text-primary" : "text-muted"
                }`}
              onClick={() => setSort("new")}
            >
              <span className="material-symbols-outlined">schedule</span>
              New
            </button>
            <button
              className={`font-bold text-lg uppercase flex items-center gap-1 pb-1 ${sort === "top" ? "text-primary" : "text-muted"
                }`}
              onClick={() => setSort("top")}
            >
              <span className="material-symbols-outlined">keyboard_double_arrow_up</span>
              Top
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.post_id}
                postId={post.post_id}
                userId={post.user_id}
                currentUserId={currentUserId}
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
        </div>
        <RightSidebar trending={trending} />
      </main>
    </div>
  );
}
