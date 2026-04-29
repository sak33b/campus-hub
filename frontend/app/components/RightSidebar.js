export default function RightSidebar({ trending = [] }) {
    return (
        <aside className="w-[300px] shrink-0 sticky top-[104px] flex flex-col gap-6">
            <div className="bg-surface border-thick rounded shadow-hard p-4">
                <h3 className="font-extrabold text-[20px] uppercase border-b-4 border-ink pb-2 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent">campaign</span>
                    Trending Tags
                </h3>
                <div className="flex flex-col gap-4">
                    {trending.length === 0 ? (
                        <div className="text-muted font-medium">No tags yet.</div>
                    ) : (
                        trending.map((item, index) => (
                            <div key={item.tag} className="group">
                                <div className="text-[13px] font-semibold text-muted uppercase">
                                    {index + 1} • #{item.tag}
                                </div>
                                <div className="font-bold text-ink group-hover:text-primary transition-colors">
                                    {item.count} posts
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="bg-accent border-thick rounded shadow-hard p-4 text-ink">
                <h3 className="font-extrabold text-[20px] uppercase border-b-4 border-ink pb-2 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">gavel</span>
                    The Yard Rules
                </h3>
                <ol className="list-decimal list-inside font-semibold text-[15px] flex flex-col gap-2">
                    <li>Keep it bold, keep it real.</li>
                    <li>No hate speech or doxxing.</li>
                    <li>Respect the hustle.</li>
                    <li>No spam or self-promo.</li>
                </ol>
            </div>
            <div className="text-xs font-bold text-muted uppercase tracking-widest text-center">
                © 2026 CampusHub
            </div>
        </aside>
    );
}
