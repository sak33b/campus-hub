import { loadLayout, requireAuth } from "../lib/layout.js";

if (requireAuth()) {
    loadLayout({ activeNav: "/messages" });
}
