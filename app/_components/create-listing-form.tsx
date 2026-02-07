"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PickLocationMapOSM from "./PickLocationMapOSM";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Star,
  CheckCircle2,
  Lightbulb,
  Upload,
  X,
  Loader2,
  Home,
  Bed,
  Maximize,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/providers/authProvider";
import PickLocationMap from "./PickLocationMap";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  address: string;
  price: number;
  rooms: number | null;
  sizeM2: number | null;
  lat: number | null;
  lng: number | null;
  photo: string;
  kind?: "SALE" | "RENT";
}

const initialFormData: FormData = {
  title: "",
  address: "",
  price: 0,
  rooms: null,
  sizeM2: null,
  lat: null,
  lng: null,
  photo: "",
};

export function CreateListingForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [location, setLocation] = useState<string>(formData.address || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: clerkUser } = useUser();
  const userData = useAuth(clerkUser?.id);
  const user = userData?.user;
  const ALL = "All";
  const { push } = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Зөвхөн зураг сонгоно уу");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Зургийн хэмжээ 5MB-аас бага байх ёстой");
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, photo: data.url }));
      toast.success("Зураг амжилттай хуулагдлаа");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Зураг хуулахад алдаа гарлаа");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setLocation("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!formData.photo) {
      toast.error("Зураг оруулна уу");
      return;
    }
    if (!formData.title) {
      toast.error("Гарчиг оруулна уу");
      return;
    }
    if (formData.lat == null || formData.lng == null) {
      toast.error("Газрын зураг дээр байршил сонгоно уу");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/bairPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: user?.id,
          title: formData.title,
          address: formData.address,
          price: formData.price,
          rooms: formData.rooms,
          sizeM2: formData.sizeM2,
          lat: formData.lat,
          lng: formData.lng,
          photo: formData.photo,
          kind: formData.kind,
        }),
      });

      if (response.ok) {
        toast.success("Амжилттай хадгалагдлаа");
        push("/");
        resetForm();
      } else {
        toast.error("Алдаа гарлаа");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role === "RENTER") {
    push("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Шинэ зар нэмэх
          </h1>
          <p className="text-gray-600">
            Өөрийн үл хөдлөх хөрөнгийн мэдээллийг оруулна уу
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* Main Form */}
          <div className="space-y-6">
            {/* Photo Upload Card */}
            <Card className="bg-white border-2 border-gray-100 shadow-lg shadow-gray-200/50 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-100 rounded-xl">
                  <Upload className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Зураг</h2>
                  <p className="text-sm text-gray-500">
                    Өндөр чанарын зураг оруулна уу
                  </p>
                </div>
              </div>

              {formData.photo ? (
                <div className="relative inline-block w-full">
                  <img
                    src={formData.photo}
                    alt="Uploaded preview"
                    className="h-64 w-full rounded-2xl object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -right-3 -top-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-2.5 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 transition-all hover:scale-110"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100/50 hover:border-teal-400 transition-all ${
                    isUploading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
                      <span className="mt-3 text-base font-medium text-gray-700">
                        Хуулж байна...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-teal-100 rounded-2xl mb-4">
                        <Upload className="h-10 w-10 text-teal-600" />
                      </div>
                      <span className="text-base font-semibold text-gray-700">
                        Зураг оруулахын тулд дарна уу
                      </span>
                      <span className="mt-2 text-sm text-gray-500">
                        PNG, JPG (5MB хүртэл)
                      </span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </Card>

            {/* Details Card */}
            <Card className="bg-white border-2 border-gray-100 shadow-lg shadow-gray-200/50 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Дэлгэрэнгүй мэдээлэл
                  </h2>
                  <p className="text-sm text-gray-500">
                    Үл хөдлөх хөрөнгийн мэдээлэл
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    Гарчиг
                  </Label>
                  <Input
                    placeholder="Жишээ нь: 2 өрөө орон сууц, Сүхбаатар дүүрэг"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border-2 border-gray-200 focus:border-teal-500 rounded-xl h-12 px-4 text-base"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Bed className="w-4 h-4 text-gray-500" />
                      Өрөөний тоо
                    </Label>
                    <Select
                      value={formData.rooms?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, rooms: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="border-2 border-gray-200 hover:border-teal-400 rounded-xl h-12 px-4">
                        <SelectValue placeholder="Сонгох" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem
                            key={num}
                            value={num.toString()}
                            className="rounded-lg"
                          >
                            {num} өрөө
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-500" />
                      Төрөл
                    </Label>
                    <Select
                      value={formData.kind || ""}
                      onValueChange={(value: "SALE" | "RENT") =>
                        setFormData({ ...formData, kind: value })
                      }
                    >
                      <SelectTrigger className="border-2 border-gray-200 hover:border-teal-400 rounded-xl h-12 px-4">
                        <SelectValue placeholder="Сонгох" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="RENT" className="rounded-lg">
                          Түрээс
                        </SelectItem>
                        <SelectItem value="SALE" className="rounded-lg">
                          Зарах
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Maximize className="w-4 h-4 text-gray-500" />
                      Талбай (м²)
                    </Label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={formData.sizeM2 ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sizeM2: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-teal-500 rounded-xl h-12 px-4 text-base"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      {formData.kind === "SALE" ? "Үнэ (₮)" : "Үнэ (₮/сар)"}
                    </Label>
                    <Input
                      type="number"
                      placeholder={
                        formData.kind === "SALE" ? "180,000,000" : "500,000"
                      }
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      className="border-2 border-gray-200 focus:border-teal-500 rounded-xl h-12 px-4 text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Хаяг
                  </Label>
                  <Select
                    value={location}
                    onValueChange={(value) => {
                      setLocation(value);
                      setFormData((prev) => ({ ...prev, address: value }));
                    }}
                  >
                    <SelectTrigger className="border-2 border-gray-200 hover:border-teal-400 rounded-xl h-12 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <SelectValue placeholder="Дүүрэг сонгох" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={ALL} className="rounded-lg">
                        Бүх дүүрэг
                      </SelectItem>
                      <SelectItem value="Bayangol" className="rounded-lg">
                        Баянгол
                      </SelectItem>
                      <SelectItem value="Bayanzurkh" className="rounded-lg">
                        Баянзүрх
                      </SelectItem>
                      <SelectItem value="Chingeltei" className="rounded-lg">
                        Чингэлтэй
                      </SelectItem>
                      <SelectItem value="Khan-Uul" className="rounded-lg">
                        Хан-Уул
                      </SelectItem>
                      <SelectItem value="Nalaikh" className="rounded-lg">
                        Налайх
                      </SelectItem>
                      <SelectItem
                        value="Songinokhairkhan"
                        className="rounded-lg"
                      >
                        Сонгинохайрхан
                      </SelectItem>
                      <SelectItem value="Sukhbaatar" className="rounded-lg">
                        Сүхбаатар
                      </SelectItem>
                      <SelectItem value="Baganuur" className="rounded-lg">
                        Багануур
                      </SelectItem>
                      <SelectItem value="Bagakhangai" className="rounded-lg">
                        Багахангай
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Газрын зураг дээр байршил сонгох
                  </Label>

                  <PickLocationMapOSM
                    lat={formData.lat}
                    lng={formData.lng}
                    onPick={({ lat, lng }) => {
                      setFormData((prev) => ({ ...prev, lat, lng }));
                      toast.success(
                        `Байршил: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                      );
                    }}
                  />

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    {formData.lat != null && formData.lng != null ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">
                              {formData.lat.toFixed(6)},{" "}
                              {formData.lng.toFixed(6)}
                            </span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({ ...p, lat: null, lng: null }))
                          }
                          className="text-sm text-red-600 hover:text-red-700 font-semibold hover:underline"
                        >
                          Арилгах
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Газрын зураг дээр дарж байршил сонгоно уу
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || isUploading}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white h-14 rounded-xl text-base font-semibold shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Хадгалж байна...
                      </span>
                    ) : (
                      "Хадгалах"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-2 border-gray-100 shadow-lg shadow-gray-200/50 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 rounded-2xl">
                <h2 className="text-lg font-bold text-white">Урьдчилан үзэх</h2>
                <p className="text-sm text-teal-50">Таны зар ингэж харагдана</p>
              </div>

              <div className="p-4">
                <div className="relative rounded-2xl overflow-hidden">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Property preview"
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                      <div className="text-center text-gray-400">
                        <div className="p-4 bg-white/80 rounded-2xl inline-block mb-3">
                          <Upload className="mx-auto h-10 w-10" />
                        </div>
                        <p className="text-sm font-medium">Зураг байхгүй</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <h3 className="font-bold text-xl text-gray-900">
                    {formData.title || "Зарын гарчиг"}
                  </h3>

                  {formData.kind && (
                    <div className="inline-block">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full">
                        {formData.kind === "RENT" ? "Түрээс" : "Зарах"}
                      </span>
                    </div>
                  )}

                  <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                    ₮{(formData.price || 0).toLocaleString()}
                    {formData.kind === "RENT" && (
                      <span className="text-lg font-normal text-gray-500">
                        /сар
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <span className="font-medium">
                      {formData.address || "Хаяг оруулаагүй"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Bed className="h-4 w-4 text-gray-500" />
                      {formData.rooms ?? "-"} өрөө
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Maximize className="h-4 w-4 text-gray-500" />
                      {formData.sizeM2 ?? "-"} м²
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg shadow-amber-200/50 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  Хэрэгтэй зөвлөгөө
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Тодорхой, сонирхол татахуйц гарчиг бичнэ",
                  "Өндөр чанарын зураг ашиглана",
                  "Үл хөдлөх хөрөнгийн онцлогийг тодруулна",
                  "Өрсөлдөхүйц үнэ тогтооно",
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-700"
                  >
                    <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
