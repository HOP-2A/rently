"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "RENTER" | "LANDLORD";

type SignupPayload = {
  username: string;
  password: string;
  type: Role;
  name?: string;
  email?: string;
  phone?: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<Role | "">("");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const canSubmit = useMemo(() => {
    if (!username.trim()) return false;
    if (!role) return false;
    if (!password) return false;
    if (password.length < 8) return false;
    if (password !== confirmPassword) return false;
    return true;
  }, [username, role, password, confirmPassword]);

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return 0;
    if (password.length < 8) return 1;
    if (password.length < 12) return 2;
    return 3;
  }, [password]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username оруулна уу");
      return;
    }
    if (!role) {
      toast.error("Role сонгоно уу");
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Password 8+ тэмдэгт байх ёстой");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password таарахгүй байна");
      return;
    }

    setLoading(true);

    try {
      const payload: SignupPayload = {
        username: username.trim(),
        password,
        type: role,
      };

      if (name.trim()) payload.name = name.trim();
      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error?: unknown }).error ?? "Signup failed")
            : "Signup failed";
        throw new Error(msg);
      }

      toast.success("Амжилттай бүртгэгдлээ!");
      router.push("/sign-in");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b-2 border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-xl group-hover:shadow-teal-500/40 transition-all group-hover:scale-105">
                <Home className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                RENTLY
              </span>
            </Link>

            <Link
              href="/sign-in"
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl border-2 border-gray-200 hover:border-teal-400 bg-white hover:bg-teal-50 transition-all font-semibold text-gray-700 hover:text-teal-700 shadow-sm text-sm sm:text-base"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Нэвтрэх</span>
              <span className="sm:hidden">Нэвтрэх</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full mb-4 sm:mb-6">
              <Shield className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-bold text-teal-700">
                Найдвартай бүртгэл
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 sm:mb-4">
              Шинэ эхлэл эхлүүлэх
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto px-4">
              Өөрийн account үүсгээд зар үзэх, хадгалах боломжтой болно
            </p>
          </div>

          <Card className="rounded-3xl shadow-2xl border-2 border-gray-200 bg-white overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-teal-500 to-teal-600">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Бүртгүүлэх
                  </h2>
                  <p className="text-sm sm:text-base text-teal-50">
                    Таны мэдээллийг оруулна уу
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={submit}
              className="p-6 sm:p-8 space-y-5 sm:space-y-6"
            >
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                  Хэрэглэгчийн нэр
                </Label>
                <div className="relative mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kenomu"
                    className="pl-16 pr-4 h-14 rounded-2xl border-2 border-gray-200 focus:border-teal-500 text-base font-medium"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Хэрэглэгчийн төрөл
                </Label>
                <div className="relative mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center z-10">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as Role)}
                  >
                    <SelectTrigger className="h-16 pl-16 pr-4 rounded-2xl border-2 border-gray-200 hover:border-blue-400 text-base font-medium">
                      <SelectValue placeholder="Төрөл сонгох" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl ">
                      <SelectItem value="RENTER" className="rounded-xl py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-bold">Түрээслэгч</p>
                            <p className="text-xs text-gray-500">
                              Орон сууц түрээслэх
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="LANDLORD" className="rounded-xl py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Home className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold">Түрээслүүлэгч</p>
                            <p className="text-xs text-gray-500">
                              Орон сууц түрээслүүлэх
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Нэр{" "}
                  <span className="text-xs text-gray-500 font-normal">
                    (заавал биш)
                  </span>
                </Label>
                <div className="relative mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Таны бүтэн нэр"
                    className="pl-16 pr-4 h-14 rounded-2xl border-2 border-gray-200 focus:border-purple-500 text-base font-medium"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Имэйл{" "}
                    <span className="text-xs text-gray-500 font-normal">
                      (заавал биш)
                    </span>
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="pl-16 pr-4 h-14 rounded-2xl border-2 border-gray-200 focus:border-orange-500 text-base font-medium"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Утас{" "}
                    <span className="text-xs text-gray-500 font-normal">
                      (заавал биш)
                    </span>
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99112233"
                      className="pl-16 pr-4 h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 text-base font-medium"
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Нууц үг
                </Label>
                <div className="relative mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8+ тэмдэгт"
                    className="pl-16 pr-14 h-14 rounded-2xl border-2 border-gray-200 focus:border-red-500 text-base font-medium"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-2 mb-2">
                      <div
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          passwordStrength >= 1 ? "bg-red-500" : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          passwordStrength >= 2
                            ? "bg-yellow-500"
                            : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          passwordStrength >= 3 ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-600">
                      {passwordStrength === 1 && "Сул"}
                      {passwordStrength === 2 && "Дунд"}
                      {passwordStrength === 3 && "Хүчтэй"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Нууц үг баталгаажуулах
                </Label>
                <div className="relative mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Нууц үгээ дахин оруулна уу"
                    className="pl-16 pr-14 h-14 rounded-2xl border-2 border-gray-200 focus:border-red-500 text-base font-medium"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <div className="mt-3">
                    {password === confirmPassword ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          Нууц үг таарч байна
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <X className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          Нууц үг таарахгүй байна
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Бүртгэж байна...
                    </span>
                  ) : (
                    "Бүртгүүлэх"
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center px-4">
                  Бүртгүүлснээр та манай{" "}
                  <Link
                    href="/terms"
                    className="text-teal-600 hover:text-teal-700 font-semibold underline"
                  >
                    үйлчилгээний нөхцөл
                  </Link>{" "}
                  болон{" "}
                  <Link
                    href="/privacy"
                    className="text-teal-600 hover:text-teal-700 font-semibold underline"
                  >
                    нууцлалын бодлого
                  </Link>
                  -ыг зөвшөөрсөнд тооцно
                </p>
              </div>
            </form>
          </Card>

          <div className="text-center mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
            <p className="text-sm sm:text-base text-gray-700">
              Аль хэдийн бүртгэлтэй юу?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-teal-600 hover:text-teal-700 transition-colors underline"
              >
                Нэвтрэх
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
