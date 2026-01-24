"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Search,
  Home,
  Mail,
  Calendar,
  Bookmark,
  Trash2,
  LogOut,
  MapPin,
  Users,
  Sliders,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ================= CONSTANTS ================= */

const ALL = "__ALL__";

/* ================= TYPES ================= */

export type ListingFromApi = {
  id: string;
  ownerId: string;
  title: string;
  address: string;
  price: number;
  rooms: number;
  sizeM2: number;
  lat: number | null;
  lng: number | null;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // your API may return either image or photo
  image?: string;
  photo?: string;

  rating?: number;
  type?: string;
};

export type ListingUI = ListingFromApi & {
  image: string; // guaranteed for UI
  rating: number;
  type: string;
};

/* ================= COMPONENT ================= */

const App = () => {
  const [listings, setListings] = useState<ListingUI[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("home");

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ DEFAULT = ALL => no filtering => show all posts
  const [location, setLocation] = useState<string>(ALL);
  const [priceRange, setPriceRange] = useState<string>(ALL);
  const [guests, setGuests] = useState<string>(ALL);
  const [propertyType, setPropertyType] = useState<string>(ALL);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/getListning");
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data = (await res.json()) as ListingFromApi[];
        console.log(data);
        const normalized: ListingUI[] = data.map((l) => ({
          ...l,
          // ✅ prefer image, fallback photo, fallback placeholder
          image:
            (l.image && l.image.trim()) ||
            (l.photo && l.photo.trim()) ||
            "/placeholder.jpg",
          rating: typeof l.rating === "number" ? l.rating : 4.8,
          type:
            typeof l.type === "string" && l.type.trim() ? l.type : "apartment",
        }));

        setListings(normalized);
      } catch (e) {
        console.error(e);
        setListings([]);
      }
    };

    run();
  }, []);

  /* ================= FILTER LOGIC ================= */

  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    // ✅ price filter only when user selected (not ALL)
    if (priceRange !== ALL) {
      const [minPrice, maxPrice] = priceRange
        .split("-")
        .map((p) => Number(p.trim()));
      filtered = filtered.filter(
        (l) => l.price >= minPrice && l.price <= maxPrice,
      );
    }

    // ✅ search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.address.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q),
      );
    }

    // ✅ location filter only when user selected (not ALL)
    if (location !== ALL) {
      const city = location.split(",")[0].toLowerCase();
      filtered = filtered.filter((l) => l.address.toLowerCase().includes(city));
    }

    // ✅ type filter only when user selected (not ALL)
    if (propertyType !== ALL) {
      filtered = filtered.filter((l) => l.type === propertyType);
    }

    // guests filter is UI only for now (no data field to filter by)
    return filtered;
  }, [listings, priceRange, searchQuery, propertyType, location]);

  /* ================= FAVORITES ================= */
  console.log(filteredListings);
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
    setGuests(ALL);
    setPropertyType(ALL);
    setSearchQuery("");
  };

  const sidebarItems = [
    { icon: Home, id: "home" },
    { icon: Mail, id: "messages" },
    { icon: Calendar, id: "calendar" },
    { icon: Bookmark, id: "saved" },
  ];

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
              className="px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50"
            >
              Clear
            </button>

            <div className="w-10 h-10 bg-teal-500 rounded-full hover:cursor-pointer" />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-20 bg-white border-r flex flex-col items-center py-8 gap-6">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-lg ${
                activeTab === item.id
                  ? "bg-teal-50 text-teal-600"
                  : "text-gray-400"
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
          <div className="mt-auto space-y-4">
            <Trash2 className="w-6 h-6 text-gray-400" />
            <LogOut className="w-6 h-6 text-red-400" />
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-4 mb-8">
              {/* ✅ Location */}
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[200px] rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <SelectValue placeholder="All locations" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All locations</SelectItem>
                  <SelectItem value="Annaba, Algeria">
                    Annaba, Algeria
                  </SelectItem>
                  <SelectItem value="Algiers, Algeria">
                    Algiers, Algeria
                  </SelectItem>
                  <SelectItem value="Oran, Algeria">Oran, Algeria</SelectItem>
                  <SelectItem value="Constantine, Algeria">
                    Constantine, Algeria
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* ✅ Price */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[180px] rounded-lg bg-white">
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Any price</SelectItem>
                  <SelectItem value="500-1500">500 - 1500</SelectItem>
                  <SelectItem value="1000-3000">1000 - 3000</SelectItem>
                  <SelectItem value="2000-4000">2000 - 4000</SelectItem>
                  <SelectItem value="3000-5000">3000 - 5000</SelectItem>
                </SelectContent>
              </Select>

              {/* ✅ Guests */}
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="w-[170px] rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <SelectValue placeholder="Any guests" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Any guests</SelectItem>
                  <SelectItem value="1-2">1-2 persons</SelectItem>
                  <SelectItem value="2-4">2-4 persons</SelectItem>
                  <SelectItem value="4-8">4-8 persons</SelectItem>
                  <SelectItem value="8+">8+ persons</SelectItem>
                </SelectContent>
              </Select>

              {/* ✅ Property type */}
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-[190px] rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    <SelectValue placeholder="Any type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Any type</SelectItem>
                  <SelectItem value="luxury-villa">Luxury Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listings */}
            <div className="grid grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="group bg-white rounded-2xl shadow-sm overflow-hidden
                  transition-all duration-300 ease-out
                  hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={listing.image}
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
                        ${listing.price}
                      </span>

                      <span className="font-semibold flex items-center gap-1">
                        ⭐ {listing.rating.toFixed(1)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm transition-colors group-hover:text-gray-800">
                      {listing.address}
                    </p>
                  </div>
                </div>
              ))}
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
};

export default App;
