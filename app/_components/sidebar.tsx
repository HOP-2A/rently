"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail, Calendar, Bookmark, Trash2, LogOut } from "lucide-react";

const sidebarItems = [
  { id: "home", href: "/", icon: Home },
  { id: "mail", href: "/mail", icon: Mail },
  { id: "calendar", href: "/calendar", icon: Calendar },
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

      <div className="mt-auto space-y-4">
        <button
          type="button"
          className="p-3 rounded-lg text-gray-400 hover:text-gray-600 transition"
          onClick={() => {}}
        >
          <Trash2 className="w-6 h-6" />
        </button>

        <button
          type="button"
          className="p-3 rounded-lg text-red-400 hover:text-red-500 transition"
          onClick={() => {}}
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
}
