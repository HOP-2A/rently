"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Search,
  Home,
  Mail,
  Calendar,
  Bookmark,
  MapPin,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__ALL__";

export type ListingFromApi = {
  id: string;
  ownerId: string;
  title: string;
  address: string;
  price: number;

  rooms: number | null;
  sizeM2: number | null;

  lat: number | null;
  lng: number | null;

  status: "PENDING" | "APPROVED" | "REJECTED";
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  photo?: string | null;

  rating?: number | null;
  image?: string | null;
  type?: string | null;
};

export default function App() {
  const [listings, setListings] = useState<ListingFromApi[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // const [activeTab, setActiveTab] = useState("home");

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<string>(ALL);
  const [priceRange, setPriceRange] = useState<string>(ALL);

  const [roomsRange, setRoomsRange] = useState<string>(ALL);
  const [sizeRange, setSizeRange] = useState<string>(ALL);
  const [approvalStatus, setApprovalStatus] = useState<string>(ALL);
  const [activeOnly, setActiveOnly] = useState<boolean>(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/getListning", { cache: "no-store" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data = (await res.json()) as ListingFromApi[];
        setListings(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setListings([]);
      }
    };

    run();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setLocation(ALL);
    setPriceRange(ALL);
    setRoomsRange(ALL);
    setSizeRange(ALL);
    setApprovalStatus(ALL);
    setActiveOnly(true);
    setSearchQuery("");
  };

  const sidebarItems = [
    { icon: Home, id: "home" },
    { icon: Mail, id: "messages" },
    { icon: Calendar, id: "calendar" },
    { icon: Bookmark, id: "saved" },
  ];

  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    filtered = filtered.filter((l) => {
      const p = typeof l.photo === "string" ? l.photo.trim() : "";
      return p.length > 0;
    });

    if (activeOnly) {
      filtered = filtered.filter((l) => l.isActive === true);
    }

    if (approvalStatus !== ALL) {
      filtered = filtered.filter((l) => l.status === approvalStatus);
    }

    if (priceRange !== ALL) {
      const [minPrice, maxPrice] = priceRange
        .split("-")
        .map((p) => Number(p.trim()));
      filtered = filtered.filter(
        (l) => l.price >= minPrice && l.price <= maxPrice,
      );
    }

    if (roomsRange !== ALL) {
      const [minR, maxR] = roomsRange.split("-").map((x) => Number(x.trim()));
      filtered = filtered.filter((l) => {
        if (l.rooms == null) return false;
        return l.rooms >= minR && l.rooms <= maxR;
      });
    }

    if (sizeRange !== ALL) {
      const [minS, maxS] = sizeRange.split("-").map((x) => Number(x.trim()));
      filtered = filtered.filter((l) => {
        if (l.sizeM2 == null) return false;
        return l.sizeM2 >= minS && l.sizeM2 <= maxS;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l) => {
        return (
          l.address.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q)
        );
      });
    }

    if (location !== ALL) {
      const city = location.split(",")[0].toLowerCase();
      filtered = filtered.filter((l) => l.address.toLowerCase().includes(city));
    }

    return filtered;
  }, [
    listings,
    activeOnly,
    approvalStatus,
    priceRange,
    roomsRange,
    sizeRange,
    searchQuery,
    location,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">RENTLY</span>
            </div>

            <nav className="flex gap-8">
              <button className="text-gray-600 hover:cursor-pointer">
                Buy
              </button>
              <button className="font-semibold border-b-2 hover:cursor-pointer">
                Rent
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>

            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50 hover:cursor-pointer"
            >
              Clear Filters
            </button>

            <div className="w-10 h-10 bg-teal-500 rounded-full hover:cursor-pointer" />
          </div>
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-4 mb-8">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[240px] rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <SelectValue placeholder="All locations" />
                  </div>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={ALL}>All locations</SelectItem>

                  <SelectItem value="Bayangol">Bayangol (Баянгол)</SelectItem>
                  <SelectItem value="Bayanzurkh">
                    Bayanzurkh (Баянзүрх)
                  </SelectItem>
                  <SelectItem value="Chingeltei">
                    Chingeltei (Чингэлтэй)
                  </SelectItem>
                  <SelectItem value="Khan-Uul">Khan-Uul (Хан-Уул)</SelectItem>
                  <SelectItem value="Nalaikh">Nalaikh (Налайх)</SelectItem>
                  <SelectItem value="Songinokhairkhan">
                    Songinokhairkhan (Сонгинохайрхан)
                  </SelectItem>
                  <SelectItem value="Sukhbaatar">
                    Sukhbaatar (Сүхбаатар)
                  </SelectItem>
                  <SelectItem value="Baganuur">Baganuur (Багануур)</SelectItem>
                  <SelectItem value="Bagakhangai">
                    Bagakhangai (Багахангай)
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[180px] rounded-lg bg-white">
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Any price</SelectItem>
                  <SelectItem value="0-1000000">0 - 1,000,000</SelectItem>
                  <SelectItem value="1000000-2000000">
                    1,000,000 - 2,000,000
                  </SelectItem>
                  <SelectItem value="2000000-4000000">
                    2,000,000 - 4,000,000
                  </SelectItem>
                  <SelectItem value="4000000-999999999">4,000,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roomsRange} onValueChange={setRoomsRange}>
                <SelectTrigger className="w-[170px] rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <SelectValue placeholder="Any rooms" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Any rooms</SelectItem>
                  <SelectItem value="0-1">Studio / 1</SelectItem>
                  <SelectItem value="2-2">2 rooms</SelectItem>
                  <SelectItem value="3-3">3 rooms</SelectItem>
                  <SelectItem value="4-99">4+ rooms</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sizeRange} onValueChange={setSizeRange}>
                <SelectTrigger className="w-[170px] rounded-lg bg-white">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Any size</SelectItem>
                  <SelectItem value="0-30">0 - 30 m²</SelectItem>
                  <SelectItem value="30-50">30 - 50 m²</SelectItem>
                  <SelectItem value="50-80">50 - 80 m²</SelectItem>
                  <SelectItem value="80-9999">80+ m²</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => setActiveOnly((v) => !v)}
                className={`px-3 py-2 rounded-lg border text-sm hover:cursor-pointer ${
                  activeOnly
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : "bg-white"
                }`}
              >
                Active only:{" "}
                {activeOnly ? "Available only" : "Show inactive too"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const photo = (listing.photo ?? "").trim();
                const rating =
                  typeof listing.rating === "number" ? listing.rating : 4.8;

                return (
                  <div
                    key={listing.id}
                    className="group bg-white rounded-2xl shadow-sm overflow-hidden
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={photo}
                        alt={listing.address}
                        className="h-52 w-full object-cover
                        transition-transform duration-500
                        group-hover:scale-110"
                      />

                      <div
                        className="absolute inset-0 bg-gradient-to-t
                        from-black/40 via-black/10 to-transparent
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-300"
                      />

                      <button
                        onClick={() => toggleFavorite(listing.id)}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur
                        p-2 rounded-full shadow
                        transition-transform duration-300
                        hover:scale-110 active:scale-95"
                        aria-label="Toggle favorite"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors duration-300 ${
                            favorites.has(listing.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600 hover:text-red-500"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 transition-colors duration-300 group-hover:bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold transition-colors group-hover:text-black">
                          ₮{listing.price}
                        </span>

                        <span className="font-semibold flex items-center gap-1">
                          ⭐ {rating.toFixed(1)}
                        </span>
                      </div>
                      <div className=" mb-1">
                        <span className="text-xl transition-colors group-hover:text-black">
                          title:{" "}
                        </span>
                        <span className="text-xl font-bold transition-colors group-hover:text-black">
                          {listing.title.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm transition-colors group-hover:text-gray-800">
                        {listing.address}
                      </p>

                      <div className="mt-2 text-xs text-gray-500 flex gap-3">
                        {listing.rooms != null && (
                          <span>{listing.rooms} rooms</span>
                        )}
                        {listing.sizeM2 != null && (
                          <span>{listing.sizeM2} m²</span>
                        )}
                        <span className="uppercase">{listing.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredListings.length === 0 && (
              <p className="text-center text-gray-500 mt-12">
                No properties found.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
