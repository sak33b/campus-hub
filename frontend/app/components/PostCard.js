
import Link from "next/link";

export default function PostCard({
    postId,
    userId,
    currentUserId,
    content,
    author,
    timestamp,
    votes,
    comments,
    userVote,
    onVote,
    onDelete,
}) {
    const handleVote = (type) => {
        if (!onVote) {
            return;
        }
        onVote(postId, type);
    };

    return (
        <article className="bg-surface border-thick rounded shadow-hard flex">
            <div className="w-[48px] shrink-0 bg-background border-r-4 border-ink flex flex-col items-center py-4 gap-2">
                <button
                    className={userVote === "upvote" ? "text-accent" : "text-muted hover:text-accent"}
                    onClick={() => handleVote("upvote")}
                    type="button"
                >
                    <span
                        className="material-symbols-outlined text-[28px]"
                        style={userVote === "upvote" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                        keyboard_arrow_up
                    </span>
                </button>
                <span className="font-bold text-[15px]">{votes}</span>
                <button
                    className={userVote === "downvote" ? "text-ink" : "text-muted hover:text-ink"}
                    onClick={() => handleVote("downvote")}
                    type="button"
                >
                    <span
                        className="material-symbols-outlined text-[28px]"
                        style={userVote === "downvote" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                        keyboard_arrow_down
                    </span>
                </button>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-muted uppercase">
                    <span className="text-primary">c/Campus</span>
                    <span>•</span>
                    <span>Posted by @{author}</span>
                    <span>•</span>
                    <span>{timestamp}</span>
                </div>
                <Link href={`/post/${postId}`} className="font-extrabold text-[22px] uppercase leading-tight text-ink">
                    {content.slice(0, 90)}
                    {content.length > 90 ? "..." : ""}
                </Link>
                <p className="font-medium text-base text-ink mt-1 line-clamp-3">{content}</p>
                <div className="flex items-center gap-4 mt-3">
                    <Link
                        href={`/post/${postId}`}
                        className="flex items-center gap-1.5 font-bold text-[13px] uppercase text-ink bg-background border-2 border-ink px-3 py-1.5 rounded shadow-soft hover:bg-surface"
                    >
                        <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                        {comments} Comments
                    </Link>
                    {onDelete && currentUserId && currentUserId === userId ? (
                        <button
                            className="flex items-center gap-1.5 font-bold text-[13px] uppercase text-red-700 bg-background border-2 border-ink px-3 py-1.5 rounded shadow-soft hover:bg-surface"
                            onClick={() => onDelete(postId)}
                            type="button"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                            Delete
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}