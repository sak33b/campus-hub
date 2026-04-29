"use client";

import LeftNav from "../components/LeftNav";
import RightSidebar from "../components/RightSidebar";
import TopNav from "../components/TopNav";
import useRequireAuth from "@/lib/requireAuth";

export default function NotificationsPage() {
    const ready = useRequireAuth();

    if (!ready) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <TopNav />
            <div className="max-w-[1200px] mx-auto flex gap-6 pt-8 px-4 items-start pb-20">
                <LeftNav active="/notifications" />
                <main className="flex-1 flex justify-center">
                    <div className="w-full max-w-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-[32px] font-extrabold uppercase tracking-tight text-ink border-b-4 border-primary pb-2 inline-block">
                                Alerts
                            </h1>
                            <button className="text-[13px] font-semibold text-muted tracking-wide uppercase">
                                Mark all read
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-surface border-thick rounded p-4 flex gap-4 items-start shadow-hard relative">
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-accent" />
                                <div className="w-12 h-12 rounded border-2 border-ink shrink-0 overflow-hidden bg-background mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between gap-2 mb-1">
                                        <p className="text-[15px] font-medium">
                                            <span className="font-bold">Alex Chen</span> replied to your
                                            post
                                        </p>
                                        <span className="text-[13px] font-semibold text-muted">2m</span>
                                    </div>
                                    <p className="text-ink font-bold text-[15px] mb-2 bg-background p-2 border-l-2 border-ink italic">
                                        &quot;Bro, the library is packed... don&apos;t even bother.&quot;
                                    </p>
                                </div>
                            </div>
                            <div className="bg-surface border-thick rounded p-4 flex gap-4 items-start shadow-hard relative">
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-accent" />
                                <div className="w-12 h-12 rounded border-2 border-ink shrink-0 overflow-hidden bg-accent flex items-center justify-center mt-1 text-ink">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        arrow_upward
                                    </span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-h-[48px]">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="text-[15px] font-medium">
                                            Your post hit <span className="font-bold">1.5k</span> upvotes!
                                        </p>
                                        <span className="text-[13px] font-semibold text-muted">1h</span>
                                    </div>
                                    <p className="text-[13px] font-semibold text-muted mt-1 truncate">
                                        &quot;Petition to make Friday classes illegal...&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <RightSidebar trending={[]} />
            </div>
        </div>
    );
}
