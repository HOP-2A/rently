"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Search,
  Bell,
  Home,
  Mail,
  Calendar,
  Bookmark,
  Trash2,
  LogOut,
  ChevronDown,
  MapPin,
  Users,
  Sliders,
} from "lucide-react";

/* ================= TYPES ================= */

export type Listing = {
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

  // UI required fields
  image: string;
  rating: number;
  type: string;
};

/* ================= COMPONENT ================= */

const App = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("home");

  const [location] = useState("Annaba, Algeria");
  const [priceRange, setPriceRange] = useState("1000 - 3000");
  const [guests] = useState("4-8 persons");
  const [propertyType] = useState("Luxury Villa");
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetch("/api/getListning")
      .then((res) => res.json())
      .then((data: Listing[]) => {
        setListings(data);
        setFilteredListings(data);
      })
      .catch(console.error);
  }, []);

  /* ================= FILTER LOGIC ================= */

  useEffect(() => {
    let filtered = [...listings];

    const [minPrice, maxPrice] = priceRange
      .split("-")
      .map((p) => Number(p.trim()));

    filtered = filtered.filter(
      (l) => l.price >= minPrice && l.price <= maxPrice,
    );

    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.type.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredListings(filtered);
  }, [priceRange, searchQuery, listings]);

  /* ================= FAVORITES ================= */

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sidebarItems = [
    { icon: Home, id: "home" },
    { icon: Mail, id: "messages" },
    { icon: Calendar, id: "calendar" },
    { icon: Bookmark, id: "saved" },
  ];

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HouseHunter</span>
            </div>

            <nav className="flex gap-8">
              <button className="text-gray-600">Categories</button>
              <button className="text-gray-600">Buy</button>
              <button className="font-semibold border-b-2">Rent</button>
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
            <Bell className="w-5 h-5 text-gray-600" />
            <div className="w-10 h-10 bg-teal-500 rounded-full" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
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

        {/* Main */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg">
                <MapPin className="w-4 h-4" />
                {location}
                <ChevronDown className="w-4 h-4" />
              </button>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option>1000 - 3000</option>
                <option>500 - 1500</option>
                <option>2000 - 4000</option>
                <option>3000 - 5000</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
                <Users className="w-4 h-4" />
                {guests}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
                <Sliders className="w-4 h-4" />
                {propertyType}
              </button>
            </div>

            {/* Listings */}
            <div className="grid grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={listing.address}
                      className="h-52 w-full object-cover"
                    />
                    <button
                      onClick={() => toggleFavorite(listing.id)}
                      className="absolute top-4 right-4 bg-white p-2 rounded-full"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(listing.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xl font-bold">
                        ${listing.price}
                      </span>
                      <span className="font-semibold">⭐ {listing.rating}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{listing.address}</p>
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
