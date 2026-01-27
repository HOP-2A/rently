"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-3">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                RENTLY
              </span>
            </Link>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Already have an account?</span>
              <Link
                href="/sign-in"
                className="font-semibold text-teal-600 hover:text-teal-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-xl mx-auto">
          <Card className="rounded-2xl shadow-sm border bg-white overflow-hidden">
            <div className="p-7 sm:p-8 border-b bg-gradient-to-r from-teal-50 to-white">
              <h1 className="text-2xl font-bold text-gray-900">Бүртгүүлэх</h1>
              <p className="text-sm text-gray-600 mt-1">
                Шинэ account үүсгээд зар харах/хадгалах боломжтой.
              </p>
            </div>

            <form onSubmit={submit} className="p-7 sm:p-8 space-y-5">
              <div>
                <Label className="text-sm text-gray-600">Username</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kenomu"
                    className="pl-10 rounded-xl"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Role</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as Role)}
                  >
                    <SelectTrigger className="pl-10 rounded-xl">
                      <SelectValue placeholder="Role сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RENTER">Түрээслэгч</SelectItem>
                      <SelectItem value="LANDLORD">Түрээслүүлэгч</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Нэр</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Таны нэр"
                    className="pl-10 rounded-xl"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="pl-10 rounded-xl"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Phone</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99112233"
                      className="pl-10 rounded-xl"
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pl-10 pr-10 rounded-xl"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  8+ тэмдэгт байвал OK.
                </p>
              </div>

              <div>
                <Label className="text-sm text-gray-600">
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="pl-10 pr-10 rounded-xl"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-2">
                    Password таарахгүй байна.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full rounded-xl h-11 bg-teal-600 hover:bg-teal-700"
              >
                {loading ? "Creating..." : "Create account"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Continue хийхэд та манай нөхцөлийг зөвшөөрсөнд тооцно.
              </p>
            </form>
          </Card>

          <div className="text-center mt-6 text-sm text-gray-600">
            <span>Already have an account?</span>{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-teal-600 hover:text-teal-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
