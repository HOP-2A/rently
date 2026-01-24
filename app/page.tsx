"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Bookmark,
  CalendarDays,
  Heart,
  Home,
  LogOut,
  Mail,
  Search,
  SlidersHorizontal,
  Trash2,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Listing = {
  id: string;
  price: number;
  title: string;
  address: string;
  rating: number;
  image: string;
  liked?: boolean;
};

const listings: Listing[] = [
  {
    id: "1",
    price: 1500,
    title: "Green Vally",
    address: "789 Green Vally, Annaba",
    rating: 8.9,
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop",
    liked: true,
  },
  {
    id: "2",
    price: 3000,
    title: "Blue Vally",
    address: "42 Blue Vally, Annaba",
    rating: 9.6,
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "3",
    price: 1000,
    title: "Seraidi Center",
    address: "Seraidi Center, Annaba",
    rating: 7.9,
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "4",
    price: 2300,
    title: "Pier House",
    address: "1200 Pier, Annaba",
    rating: 8.1,
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "5",
    price: 2990,
    title: "Boulevard 20m",
    address: "Boulevard 20m, Annaba",
    rating: 9.6,
    image:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "6",
    price: 3000,
    title: "Seraidi Ville",
    address: "Seraidi Ville, Annaba",
    rating: 9.8,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
    liked: true,
  },
];

function money(n: number) {
  return `$${n.toLocaleString()}`;
}

function IconPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-black/5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [liked, setLiked] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(listings.map((l) => [l.id, !!l.liked])),
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return listings;
    const q = query.toLowerCase();
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        String(l.price).includes(q),
    );
  }, [query]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#eef2f1]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-3xl bg-[#f7f9f9] p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex gap-6">
              {/* Sidebar */}
              <aside className="hidden w-20 shrink-0 flex-col items-center justify-between rounded-2xl bg-white px-3 py-5 shadow-sm ring-1 ring-black/5 md:flex">
                <div className="flex flex-col items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="#"
                        className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      >
                        <Home className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Home</TooltipContent>
                  </Tooltip>

                  <SidebarIcon
                    icon={<Mail className="h-5 w-5" />}
                    label="Messages"
                  />
                  <SidebarIcon
                    icon={<CalendarDays className="h-5 w-5" />}
                    label="Calendar"
                  />
                  <SidebarIcon
                    icon={<Bookmark className="h-5 w-5" />}
                    label="Saved"
                  />

                  <Separator className="my-2 w-10" />

                  <SidebarIcon
                    icon={<Trash2 className="h-5 w-5" />}
                    label="Trash"
                  />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <SidebarIcon
                    icon={<LogOut className="h-5 w-5 text-red-500" />}
                    label="Logout"
                  />
                </div>
              </aside>

              {/* Main */}
              <main className="min-w-0 flex-1">
                {/* Top bar */}
                <header className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                      <Home className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-lg font-semibold">HouseHunter</div>
                      <div className="text-xs text-muted-foreground">
                        Find your next place
                      </div>
                    </div>

                    <nav className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                      <Link href="#" className="hover:text-foreground">
                        Categories
                      </Link>
                      <Link href="#" className="hover:text-foreground">
                        Buy
                      </Link>
                      <Link
                        href="#"
                        className="relative font-semibold text-foreground"
                      >
                        Rent
                        <span className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-600" />
                      </Link>
                    </nav>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative hidden w-[320px] md:block">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className="h-10 rounded-2xl bg-white pl-9 shadow-sm ring-1 ring-black/5"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                    >
                      <Bell className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&auto=format&fit=crop" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="hidden pr-2 text-sm font-medium md:block">
                        User
                      </div>
                    </div>
                  </div>
                </header>

                {/* Filters row */}
                <section className="mt-6 flex flex-wrap items-center gap-3">
                  <IconPill icon={<SlidersHorizontal className="h-4 w-4" />}>
                    <span className="text-muted-foreground">Filters</span>
                  </IconPill>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-black/5">
                      <Select defaultValue="annaba">
                        <SelectTrigger className="h-9 w-[170px] rounded-full border-0 bg-transparent shadow-none focus:ring-0">
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annaba">
                            Annaba, Algeria
                          </SelectItem>
                          <SelectItem value="ub">Ulaanbaatar</SelectItem>
                          <SelectItem value="tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-black/5">
                      <Select defaultValue="1000-3000">
                        <SelectTrigger className="h-9 w-[150px] rounded-full border-0 bg-transparent shadow-none focus:ring-0">
                          <SelectValue placeholder="Budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500-1000">
                            $500 - $1,000
                          </SelectItem>
                          <SelectItem value="1000-3000">
                            $1,000 - $3,000
                          </SelectItem>
                          <SelectItem value="3000+">$3,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-black/5">
                      <Select defaultValue="4-8">
                        <SelectTrigger className="h-9 w-[150px] rounded-full border-0 bg-transparent shadow-none focus:ring-0">
                          <SelectValue placeholder="People" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 persons</SelectItem>
                          <SelectItem value="2-4">2-4 persons</SelectItem>
                          <SelectItem value="4-8">4-8 persons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-black/5">
                      <Select defaultValue="luxury">
                        <SelectTrigger className="h-9 w-[160px] rounded-full border-0 bg-transparent shadow-none focus:ring-0">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="luxury">Luxury Villa</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Cards grid */}
                <section className="mt-8">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((l) => (
                      <Card
                        key={l.id}
                        className="overflow-hidden rounded-3xl border-0 bg-white shadow-sm ring-1 ring-black/5"
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <div className="relative h-44 w-full">
                              <Image
                                src={l.image}
                                alt={l.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1280px) 50vw, 33vw"
                              />
                            </div>

                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() =>
                                setLiked((prev) => ({
                                  ...prev,
                                  [l.id]: !prev[l.id],
                                }))
                              }
                              className={cn(
                                "absolute right-3 top-3 h-10 w-10 rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/10 hover:bg-white",
                                liked[l.id] && "text-rose-500",
                              )}
                            >
                              <Heart
                                className={cn(
                                  "h-5 w-5",
                                  liked[l.id] && "fill-current",
                                )}
                              />
                            </Button>
                          </div>

                          <div className="px-5 pt-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-lg font-semibold text-emerald-700">
                                {money(l.price)}
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">
                                  {l.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-1 text-sm text-muted-foreground">
                              {l.address}
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="flex items-center justify-between px-5 pb-5 pt-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="rounded-full">
                              {l.title}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                          >
                            Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {filtered.length === 0 && (
                    <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
                      <div className="text-lg font-semibold">No results</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Try a different keyword.
                      </div>
                    </div>
                  )}
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SidebarIcon({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="grid h-12 w-12 place-items-center rounded-2xl text-muted-foreground hover:bg-muted/60 hover:text-foreground">
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
