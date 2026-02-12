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
  X,
  ArrowRight,
  Sparkles,
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a620_1px,transparent_1px),linear-gradient(to_bottom,#14b8a620_1px,transparent_1px)] bg-[size:40px_40px]" />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b-2 border-teal-200 shadow-lg shadow-teal-100/50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-xl shadow-teal-500/30">
                  <Home className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  RENTLY
                </span>
                <p className="text-xs text-teal-600 font-medium">
                  Орон сууцны зах зээл
                </p>
              </div>
            </Link>

            <Link
              href="/sign-in"
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-teal-50 border-2 border-teal-200 hover:border-teal-400 transition-all font-semibold text-teal-700 hover:text-teal-800 shadow-sm"
            >
              <User className="w-4 h-4" />
              <span>Нэвтрэх</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full border-2 border-teal-300/50 shadow-lg shadow-teal-200/50">
            <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
            <span className="text-sm font-bold text-teal-700">
              Найдвартай бүртгэл
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black">
            <span className="block text-gray-900 mb-2">Шинэ эхлэл</span>
            <span className="block bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              эхлүүлэх
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Өөрийн account үүсгээд зар үзэх, хадгалах, түрээслэх боломжтой болно
          </p>
        </div>

        <Card className="max-w-5xl mx-auto rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-teal-200 shadow-2xl shadow-teal-200/50 overflow-hidden">
          <div className="relative px-8 lg:px-12 py-10 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 border-b-2 border-teal-400">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl" />
                <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-1">
                  Бүртгүүлэх
                </h2>
                <p className="text-teal-50 font-medium">
                  Таны мэдээллийг оруулна уу
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="px-8 lg:px-12 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  Хэрэглэгчийн нэр
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="absolute left-5 w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="kenomu"
                      className="pl-20 pr-6 h-16 rounded-2xl bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 text-lg font-medium placeholder:text-gray-400 transition-all shadow-sm"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Хэрэглэгчийн төрөл
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="absolute left-5 w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center z-10">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <Select
                      value={role}
                      onValueChange={(v) => setRole(v as Role)}
                    >
                      <SelectTrigger className="pl-20 pr-6 h-16 rounded-2xl bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-900 text-lg font-medium shadow-sm">
                        <SelectValue placeholder="Төрөл сонгох" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl">
                        <SelectItem
                          value="RENTER"
                          className="rounded-xl py-4 focus:bg-teal-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                              <User className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                Түрээслэгч
                              </p>
                              <p className="text-xs text-gray-500">
                                Орон сууц түрээслэх
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="LANDLORD"
                          className="rounded-xl py-4 focus:bg-emerald-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <Home className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                Түрээслүүлэгч
                              </p>
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
              </div>

              <div className="space-y-3 lg:col-span-2">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  Нэр
                  <span className="text-xs text-gray-500 font-normal">
                    (заавал биш)
                  </span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-teal-400/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="absolute left-5 w-11 h-11 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-cyan-600" />
                    </div>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Таны бүтэн нэр"
                      className="pl-20 pr-6 h-16 rounded-2xl bg-white border-2 border-gray-200 focus:border-cyan-500 text-gray-900 text-lg font-medium placeholder:text-gray-400 transition-all shadow-sm"
                      autoComplete="name"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  Имэйл
                  <span className="text-xs text-gray-500 font-normal">
                    (заавал биш)
                  </span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="absolute left-5 w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-teal-600" />
                    </div>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="pl-20 pr-6 h-16 rounded-2xl bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 text-lg font-medium placeholder:text-gray-400 transition-all shadow-sm"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Утас
                  <span className="text-xs text-gray-500 font-normal">
                    (заавал биш)
                  </span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="absolute left-5 w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99112233"
                      className="pl-20 pr-6 h-16 rounded-2xl bg-white border-2 border-gray-200 focus:border-emerald-500 text-gray-900 text-lg font-medium placeholder:text-gray-400 transition-all shadow-sm"
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  Нууц үг
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="absolute left-5 w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-teal-600" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8+ тэмдэгт"
                      className="pl-20 pr-16 h-16 rounded-2xl bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 text-lg font-medium placeholder:text-gray-400 transition-all shadow-sm"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-5 w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {password.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${passwordStrength >= 1 ? "bg-red-500" : "bg-gray-200"}`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${passwordStrength >= 2 ? "bg-yellow-500" : "bg-gray-200"}`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${passwordStrength >= 3 ? "bg-emerald-500" : "bg-gray-200"}`}
                      />
                    </div>
                    <p className="text-xs font-bold text-gray-600">
                      {passwordStrength === 1 && "Сул"}
                      {passwordStrength === 2 && "Дунд"}
                      {passwordStrength === 3 && "Хүчтэй"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  Нууц үг баталгаажуулах
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center">
                    <div className="absolute left-5 w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-teal-600" />
                    </div>
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Нууц үгээ дахин оруулна уу"
                      className="pl-20 pr-16 h-16 rounded-2xl bg-white border-2 border-gray-200 focus:border-teal-500 text-gray-900 text-lg font-medium placeholder:text-gray-400 transition-all shadow-sm"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-5 w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {confirmPassword.length > 0 && (
                  <div className="pt-2">
                    {password === confirmPassword ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-bold">
                          Нууц үг таарч байна
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-500">
                        <X className="w-5 h-5" />
                        <span className="text-sm font-bold">
                          Нууц үг таарахгүй байна
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 space-y-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="relative w-full h-16 rounded-2xl text-lg font-black bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
                    <span className="flex items-center gap-2">
                      Бүртгүүлэх
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Бүртгүүлснээр та манай{" "}
                <Link
                  href="/terms"
                  className="text-teal-600 hover:text-teal-700 font-bold underline"
                >
                  үйлчилгээний нөхцөл
                </Link>{" "}
                болон{" "}
                <Link
                  href="/privacy"
                  className="text-teal-600 hover:text-teal-700 font-bold underline"
                >
                  нууцлалын бодлого
                </Link>
                -ыг зөвшөөрсөнд тооцно
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center mt-10">
          <div className="inline-block p-6 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-teal-200 shadow-lg shadow-teal-200/50">
            <p className="text-gray-700 font-medium">
              Аль хэдийн бүртгэлтэй юу?{" "}
              <Link
                href="/sign-in"
                className="font-black text-teal-600 hover:text-teal-700 transition-all underline"
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
