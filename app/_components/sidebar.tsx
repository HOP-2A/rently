"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Trash2, LogOut, UserRoundIcon } from "lucide-react";

const sidebarItems = [
  { id: "home", href: "/", icon: Home },
  { id: "profile", href: "/profile", icon: UserRoundIcon },
  { id: "bookmark", href: "/bookmarks", icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";

    return pathname.startsWith(href);
  };

  return (
    <aside className="w-20 bg-white border-r flex flex-col items-center py-8 gap-6">
      {sidebarItems.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`p-3 rounded-lg transition ${
              active
                ? "bg-teal-50 text-teal-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        );
      })}
    </aside>
  );
}
