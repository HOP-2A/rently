"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [avatar, setAvatar] = useState("");
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setUsername("");
    setName("");
    setPhone("");
    setAbout("");
    setAvatar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const back = () => {
    router.push("/profile");
  };
  const validatePhone8 = (raw: string) => {
    const digits = onlyDigits(raw);
    if (digits.length === 0) return { ok: true, digits: "" };
    if (digits.length !== 8) return { ok: false, digits };
    return { ok: true, digits };
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setAvatar(data.url);
      toast.success("Avatar амжилттай хуулагдлаа");
    } catch (err) {
      console.error(err);
      toast.error("Avatar хуулахад алдаа гарлаа");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = () => {
    setAvatar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function onSave() {
    if (!username.trim()) {
      toast.error("Username хоосон байж болохгүй");
      return;
    }
    if (!name.trim()) {
      toast.error("Нэр хоосон байж болохгүй");
      return;
    }
    if (!about.trim()) {
      toast.error("About хоосон байж болохгүй");
      return;
    }
    if (!avatar) {
      toast.error("Profile зураг шаардлагатай");
      return;
    }

    const v = validatePhone8(phone);
    if (!v.ok) {
      toast.error("Утасны дугаар яг 8 оронтой байх ёстой");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/editProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          name,
          phone: v.digits,
          about,
          avatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Алдаа гарлаа");
        return;
      }

      toast.success("Амжилттай хадгалагдлаа ✅");

      router.push("/profile");
    } catch (e) {
      toast.error("Сүлжээний алдаа");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 p-6">
      <button
        className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 hover:cursor-pointer mt-10 ml-10 bg-white"
        onClick={back}
      >
        ← Буцах
      </button>
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border-2 border-gray-100 bg-white shadow-lg shadow-gray-200/50">
          <div className="rounded-t-3xl bg-gradient-to-r from-teal-500 to-teal-600 p-5 text-white">
            <div className="text-lg font-extrabold">Profile edit</div>
            <div className="text-sm text-white/80">
              Өөрийн мэдээллээ эндээс шинэчилнэ
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={
                  avatar ||
                  "https://api.dicebear.com/7.x/initials/svg?seed=Rently&backgroundColor=0ea5a4&textColor=ffffff"
                }
                alt="avatar"
                className="h-14 w-14 rounded-2xl border-2 border-gray-200 bg-white object-cover"
              />
              <div className="text-sm">
                <div className="font-bold text-gray-900">
                  {name || "Таны нэр"}
                </div>
                <div className="text-gray-500">
                  {username ? `@${username}` : "@username"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-teal-100 p-2">
                  <Upload className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-gray-900">
                    Avatar зураг
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG (5MB хүртэл)
                  </div>
                </div>
              </div>

              {avatar ? (
                <div className="relative">
                  <img
                    src={avatar}
                    alt="avatar uploaded"
                    className="h-40 w-full rounded-2xl object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -right-3 -top-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-2.5 text-white shadow-lg shadow-red-500/30 transition-all hover:scale-110"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-teal-50 hover:to-teal-100/50 hover:border-teal-400 transition-all ${
                    isUploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                      <span className="mt-2 text-sm font-semibold text-gray-700">
                        Хуулж байна...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="mb-3 rounded-2xl bg-teal-100 p-3">
                        <Upload className="h-8 w-8 text-teal-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Зураг оруулахын тулд дарна уу
                      </span>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs font-bold text-gray-700">
                Username
              </div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="zolo"
                className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-sm outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <div className="mb-1 text-xs font-bold text-gray-700">Нэр</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Zolbayar"
                className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-sm outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <div className="mb-1 text-xs font-bold text-gray-700">Утас</div>
              <input
                value={phone}
                onChange={(e) => {
                  const digits = onlyDigits(e.target.value);
                  setPhone(digits.slice(0, 8));
                }}
                placeholder="9911xxxx"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-sm outline-none focus:border-teal-500"
              />
              <div className="mt-1 text-[11px] text-gray-500">
                {phone.length > 0
                  ? `${phone.length}/8`
                  : "8 оронтой дугаар оруулна"}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-bold text-gray-700">About</div>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Өөрийн тухай..."
                className="min-h-[110px] w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </div>

            <button
              onClick={onSave}
              disabled={isSaving || isUploading}
              className="h-14 w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-60"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Хадгалж байна...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
