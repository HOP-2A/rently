"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Home,
  Tag,
  DollarSign,
  Bed,
  Ruler,
  ImageIcon,
} from "lucide-react";

const PickLocationMapOSM = dynamic(
  () => import("@/app/_components/PickLocationMapOSM"),
  { ssr: false },
);

type ListingKind = "SALE" | "RENT";

interface ListingData {
  id: string;
  title: string;
  address: string;
  price: number;
  rooms: number | null;
  sizeM2: number | null;
  lat: number | null;
  lng: number | null;
  photo: string;
  kind: ListingKind;
}

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { back } = useRouter();
  const [formData, setFormData] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`/api/getListning/${params.listingId}`);
      if (!res.ok) {
        toast.error("Зар олдсонгүй");
        return;
      }
      const data = await res.json();
      setFormData(data);
    };
    if (params?.listingId) fetchListing();
  }, [params]);

  if (!formData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Уншиж байна...</p>
        </div>
      </div>
    );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();
      setFormData((prev) => prev && { ...prev, photo: data.url });
      toast.success("Зураг амжилттай байршлаа");
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return toast.error("Нэвтэрч орно уу");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/editPost/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success("Амжилттай заслаа");
      router.push("/");
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800">Зар засах</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div
            className="relative h-56 bg-gray-100 group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.photo ? (
              <img
                src={formData.photo}
                alt="listing"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                <ImageIcon className="w-10 h-10" />
                <span className="text-sm">Зураг байхгүй</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
              <Upload className="w-4 h-4" />
              {isUploading ? "Байршуулж байна..." : "Зураг солих"}
            </div>
            {formData.kind && (
              <span
                className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${formData.kind === "RENT" ? "bg-teal-500 text-white" : "bg-gray-800 text-white"}`}
              >
                {formData.kind === "RENT" ? "Түрээс" : "Зарах"}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="text-xs text-gray-400">Зураг дарж солих боломжтой</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          <div className="p-5 space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Гарчиг
            </Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Зарын гарчиг"
              className="border-gray-200 rounded-xl focus:border-teal-400 focus:ring-teal-400/20 text-gray-800"
            />
          </div>

          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Үнэ
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                  ₮
                </span>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="pl-7 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Төрөл
              </Label>
              <Select
                value={formData.kind}
                onValueChange={(v: ListingKind) =>
                  setFormData({ ...formData, kind: v })
                }
              >
                <SelectTrigger className="border-gray-200 rounded-xl focus:border-teal-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Түрээс</SelectItem>
                  <SelectItem value="SALE">Зарах</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" /> Өрөө
              </Label>
              <Input
                type="number"
                value={formData.rooms ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rooms: parseInt(e.target.value) || null,
                  })
                }
                placeholder="Өрөөний тоо"
                className="border-gray-200 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> Талбай (м²)
              </Label>
              <Input
                type="number"
                value={formData.sizeM2 ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sizeM2: parseInt(e.target.value) || null,
                  })
                }
                placeholder="м²"
                className="border-gray-200 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
              />
            </div>
          </div>

          <div className="p-5 space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Хаяг
            </Label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Хаяг оруулах"
              className="border-gray-200 rounded-xl focus:border-teal-400 focus:ring-teal-400/20"
            />
          </div>

          <div className="p-5 space-y-3">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Байршил
            </Label>
            <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
              <PickLocationMapOSM
                lat={formData.lat}
                lng={formData.lng}
                onPick={({ lat, lng }) =>
                  setFormData({ ...formData, lat, lng })
                }
              />
            </div>
            {formData.lat && formData.lng && (
              <p className="text-xs text-gray-400">
                {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button
            onClick={() => back()}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Болих
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isUploading}
            className="flex-[2] py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-sm shadow-teal-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Хадгалж байна...
              </span>
            ) : (
              "Хадгалах"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
