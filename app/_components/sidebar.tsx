"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/authProvider"; // <- adjust if your path differs
import {
  Home,
  Bookmark,
  UserRoundIcon,
  Plus,
  type LucideIcon,
  Album,
} from "lucide-react";

type SidebarItem = {
  id: string;
  href: string;
  icon: LucideIcon;
  landlordOnly?: boolean;
  hideForLandlord?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { id: "home", href: "/", icon: Home },
  { id: "profile", href: "/profile", icon: UserRoundIcon },
  { id: "bookmark", href: "/bookmarks", icon: Bookmark, hideForLandlord: true },
  {
    id: "add",
    href: "/LandLord/createListing",
    icon: Plus,
    landlordOnly: true,
  },
  { id: "album", href: "/rentalRequest", icon: Album, landlordOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  const { user: clerkUser } = useUser();
  const user2 = useAuth(clerkUser?.id);
  const user = user2.user;

  const isLandlord = user?.role === "LANDLORD";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const visibleItems = sidebarItems.filter((item) => {
    if (item.landlordOnly && !isLandlord) return false;
    if (item.hideForLandlord && isLandlord) return false;
    return true;
  });

  return (
    <aside className="w-20 bg-white border-r flex flex-col items-center py-8 gap-6">
      {visibleItems.map((item) => {
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
