import Link from "next/link";

const NAV_ITEMS = [
    { href: "/", label: "Feed", icon: "home" },
    { href: "/messages", label: "Messages", icon: "mail" },
    { href: "/notifications", label: "Alerts", icon: "notifications" },
    { href: "/search", label: "Search", icon: "search" },
];

export default function LeftNav({ active = "/" }) {
    return (
        <aside className="w-[240px] shrink-0 sticky top-[104px]">
            <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = active === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded font-semibold text-lg uppercase border-4 transition-all ${isActive
                                    ? "bg-surface shadow-hard border-ink text-primary"
                                    : "border-transparent hover:bg-surface hover:border-ink hover:shadow-hard"
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined ${isActive ? "text-primary" : "text-ink"
                                    }`}
                            >
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <Link
                href="/"
                className="w-full mt-8 bg-primary text-surface border-thick rounded py-4 font-bold text-lg uppercase shadow-hard btn-press tracking-wide flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined">edit_square</span>
                Start a Thread
            </Link>
        </aside>
    );
}
