"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { toast } from "sonner";

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

  const ALL = "All";
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only choose photo");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("The photos size should be 5MB or less");
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
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Something went wrong while uploading photo");
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
      toast.error("Enter the photo");
      return;
    }
    if (!formData.title) {
      toast.error("Enter the title");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/bairPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: "NZn2ejIXlDy7d71CR0VYe",
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
        toast.success("Saved Successfully");
        resetForm();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <h1 className="mb-6 text-2xl font-bold text-foreground">
              Create New Listing
            </h1>

            <Card className="bg-white p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">
                Write your details here
              </h2>

              <div className="space-y-5">
                <div>
                  <Label className="mb-2 text-sm text-gray-600">Photo</Label>
                  <div className="mt-2">
                    {formData.photo ? (
                      <div className="relative inline-block">
                        <img
                          src={formData.photo || "/placeholder.svg"}
                          alt="Uploaded preview"
                          className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors ${
                          isUploading ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#5d8a6b]" />
                            <span className="mt-2 text-sm text-gray-500">
                              Uploading...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="mt-2 text-sm text-gray-500">
                              Click to upload photo
                            </span>
                            <span className="mt-1 text-xs text-gray-400">
                              PNG, JPG up to 5MB
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
                  </div>
                </div>

                <div>
                  <Label className="mb-2 text-sm text-gray-600">
                    Listing Title
                  </Label>
                  <Input
                    placeholder="Luxury Villa with Ocean View"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border-gray-200"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label className="mb-2 text-sm text-gray-600">Rooms</Label>
                    <Select
                      value={formData.rooms?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, rooms: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="border-gray-200 hover:cursor-pointer">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 text-sm text-gray-600">Kind</Label>
                    <Select
                      value={formData.kind || ""}
                      onValueChange={(value: "SALE" | "RENT") =>
                        setFormData({ ...formData, kind: value })
                      }
                    >
                      <SelectTrigger className="border-gray-200 hover:cursor-pointer">
                        <SelectValue placeholder="Select kind" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="RENT">Rent</SelectItem>
                        <SelectItem value="SALE">Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 text-sm text-gray-600">
                      Size (m²)
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
                      className="border-gray-200"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 text-sm text-gray-600">
                      {formData.kind === "SALE" ? "Price (₮)" : "Price (₮/mo)"}
                    </Label>

                    <Input
                      type="number"
                      placeholder={
                        formData.kind === "SALE" ? "180000000" : "500000"
                      }
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      className="border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 text-sm text-gray-600">Address</Label>
                  <Select
                    value={location}
                    onValueChange={(value) => {
                      setLocation(value);
                      setFormData((prev) => ({ ...prev, address: value }));
                    }}
                  >
                    <SelectTrigger className="w-[240px] rounded-lg bg-white hover:cursor-pointer">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <SelectValue placeholder="All locations" />
                      </div>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={ALL}>All locations</SelectItem>
                      <SelectItem value="Bayangol">
                        Bayangol (Баянгол)
                      </SelectItem>
                      <SelectItem value="Bayanzurkh">
                        Bayanzurkh (Баянзүрх)
                      </SelectItem>
                      <SelectItem value="Chingeltei">
                        Chingeltei (Чингэлтэй)
                      </SelectItem>
                      <SelectItem value="Khan-Uul">
                        Khan-Uul (Хан-Уул)
                      </SelectItem>
                      <SelectItem value="Nalaikh">Nalaikh (Налайх)</SelectItem>
                      <SelectItem value="Songinokhairkhan">
                        Songinokhairkhan (Сонгинохайрхан)
                      </SelectItem>
                      <SelectItem value="Sukhbaatar">
                        Sukhbaatar (Сүхбаатар)
                      </SelectItem>
                      <SelectItem value="Baganuur">
                        Baganuur (Багануур)
                      </SelectItem>
                      <SelectItem value="Bagakhangai">
                        Bagakhangai (Багахангай)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || isUploading}
                    className="bg-[#5d8a6b] px-8 hover:bg-[#4a7558] hover:cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:pt-[72px] ">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Preview
            </h2>

            <Card className="overflow-hidden bg-white ">
              <div className="relative p-2 rounded-xl">
                {formData.photo ? (
                  <img
                    src={formData.photo || "/placeholder.svg"}
                    alt="Property preview"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-100 rounded-xl p-">
                    <div className="text-center text-gray-400">
                      <Upload className="mx-auto h-8 w-8" />
                      <p className="mt-2 text-sm">No photo uploaded</p>
                    </div>
                  </div>
                )}
                <button className="absolute right-3 top-3 rounded-full bg-white/80 p-2"></button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">
                  {formData.title || "Your Listing Title"}
                </h3>
                <span className="">For: {formData.kind ?? "-"}</span>
                <p className="mb-2 text-xl font-bold text-[#5d8a6b]">
                  ₮{(formData.price || 0).toLocaleString()}
                  {formData.kind === "RENT" && (
                    <span className="text-sm font-normal text-gray-500">
                      /mo
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-[#5d8a6b]" />
                  {formData.address || "Address will appear here"}
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {formData.rooms ?? "-"} rooms
                  </span>
                  <span>·</span>
                  <span>{formData.sizeM2 ?? "-"} m²</span>
                </div>
              </div>
            </Card>

            <Card className="mt-4 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#5d8a6b]" />
                <h3 className="font-semibold text-foreground">
                  Tips for a Great Listing
                </h3>
              </div>
              <ul className="space-y-2">
                {[
                  "Use a catchy and descriptive title",
                  "Add high-quality photos",
                  "Highlight the property's key features",
                  "Set a competitive price",
                ].map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#5d8a6b]" />
                    {tip}
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
