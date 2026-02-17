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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  name: string;
  email: string;
  phone: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!username.trim()) return false;
    if (!role) return false;
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    if (!phone.trim()) return false;
    if (!password || password.length < 8) return false;
    if (password !== confirmPassword) return false;
    return true;
  }, [username, role, name, email, phone, password, confirmPassword]);

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return 0;
    if (password.length < 8) return 1;
    if (password.length < 12) return 2;
    return 3;
  }, [password]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload: SignupPayload = {
        username: username.trim(),
        password,
        type: role as Role,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
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

  const strengthLabel = ["", "Сул", "Дунд", "Хүчтэй"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .su-root {
          min-height: 100vh;
          background: #f8f7f4;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .su-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 68px;
          background: #f8f7f4;
          border-bottom: 1px solid #e4e0d8;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .su-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .su-logo-icon {
          width: 36px;
          height: 36px;
          background: #1a1a1a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .su-logo-icon svg {
          width: 18px;
          height: 18px;
          stroke: #f8f7f4;
        }

        .su-logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }

        .su-header-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #555;
          text-decoration: none;
          padding: 8px 16px;
          border: 1px solid #d6d1c8;
          border-radius: 8px;
          background: transparent;
          transition: all 0.15s ease;
        }

        .su-header-link:hover {
          background: #1a1a1a;
          color: #f8f7f4;
          border-color: #1a1a1a;
        }

        /* ── Main layout ── */
        .su-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: calc(100vh - 68px);
        }

        /* ── Left panel ── */
        .su-left {
          background: #1a1a1a;
          padding: 64px 56px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .su-left::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, #2d6a4f22 0%, transparent 70%);
          border-radius: 50%;
        }

        .su-left-top {
          position: relative;
          z-index: 1;
        }

        .su-left-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b9e7e;
          margin-bottom: 28px;
        }

        .su-left-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 52px;
          line-height: 1.08;
          color: #f8f7f4;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }

        .su-left-heading em {
          font-style: italic;
          color: #7ec8a0;
        }

        .su-left-desc {
          font-size: 15px;
          color: #9a9486;
          line-height: 1.65;
          max-width: 320px;
        }

        .su-left-bottom {
          position: relative;
          z-index: 1;
        }

        .su-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .su-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #9a9486;
        }

        .su-feature-dot {
          width: 6px;
          height: 6px;
          background: #7ec8a0;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Right panel ── */
        .su-right {
          background: #f8f7f4;
          padding: 56px 64px;
          overflow-y: auto;
        }

        .su-right-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .su-right-sub {
          font-size: 14px;
          color: #888;
          margin-bottom: 40px;
        }

        /* ── Form grid ── */
        .su-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .su-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .su-row.full {
          grid-template-columns: 1fr;
        }

        /* ── Field ── */
        .su-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .su-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #555;
        }

        .su-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .su-input-icon {
          position: absolute;
          left: 14px;
          color: #aaa;
          display: flex;
          align-items: center;
          pointer-events: none;
          z-index: 1;
        }

        .su-input-icon svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
        }

        .su-input {
          width: 100%;
          height: 48px;
          padding: 0 14px 0 42px;
          background: #fff;
          border: 1px solid #ddd8d0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
        }

        .su-input::placeholder {
          color: #bbb;
        }

        .su-input:focus {
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(26,26,26,0.07);
        }

        .su-input.error {
          border-color: #ef4444;
        }

        .su-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.15s;
        }

        .su-eye-btn:hover { color: #555; }
        .su-eye-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; }

        /* ── Select override ── */
        .su-select-trigger {
          width: 100%;
          height: 48px;
          padding: 0 14px 0 42px;
          background: #fff;
          border: 1px solid #ddd8d0 !important;
          border-radius: 10px !important;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          box-shadow: none !important;
          outline: none !important;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .su-select-trigger:focus, .su-select-trigger[data-state="open"] {
          border-color: #1a1a1a !important;
          box-shadow: 0 0 0 3px rgba(26,26,26,0.07) !important;
        }

        .su-select-content {
          background: #fff;
          border: 1px solid #ddd8d0;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          overflow: hidden;
        }

        .su-select-item {
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.1s;
          border-radius: 8px;
          margin: 4px;
        }

        .su-select-item:hover { background: #f2ede6; }

        /* ── Password strength ── */
        .su-strength {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }

        .su-strength-bars {
          display: flex;
          gap: 4px;
        }

        .su-strength-bar {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: #e4e0d8;
          transition: background 0.2s;
        }

        .su-strength-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        /* ── Password match ── */
        .su-match {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 12px;
          font-weight: 500;
        }
        .su-match svg { width: 14px; height: 14px; stroke: currentColor; fill: none; }

        /* ── Divider ── */
        .su-divider {
          height: 1px;
          background: #e4e0d8;
          margin: 28px 0;
        }

        /* ── Submit ── */
        .su-submit {
          width: 100%;
          height: 52px;
          background: #1a1a1a;
          color: #f8f7f4;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
        }

        .su-submit:hover:not(:disabled) {
          background: #333;
        }

        .su-submit:active:not(:disabled) {
          transform: scale(0.99);
        }

        .su-submit:disabled {
          background: #ccc;
          color: #999;
          cursor: not-allowed;
        }

        .su-submit svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
          transition: transform 0.15s;
        }

        .su-submit:hover:not(:disabled) svg {
          transform: translateX(3px);
        }

        .su-spin {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: su-spin 0.7s linear infinite;
        }

        @keyframes su-spin { to { transform: rotate(360deg); } }

        /* ── Footer note ── */
        .su-footer-note {
          font-size: 12px;
          color: #aaa;
          text-align: center;
          margin-top: 16px;
          line-height: 1.6;
        }

        .su-footer-note a {
          color: #555;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .su-footer-note a:hover { color: #1a1a1a; }

        /* ── Already registered ── */
        .su-already {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid #e4e0d8;
          font-size: 14px;
          color: #888;
          text-align: center;
        }

        .su-already a {
          color: #1a1a1a;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 1px;
        }

        .su-already a:hover { opacity: 0.6; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .su-main {
            grid-template-columns: 1fr;
          }
          .su-left {
            padding: 48px 32px;
            min-height: auto;
          }
          .su-left-heading { font-size: 38px; }
          .su-right { padding: 40px 24px; }
          .su-header { padding: 0 24px; }
          .su-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="su-root">
        <header className="su-header">
          <Link href="/" className="su-logo">
            <div className="su-logo-icon">
              <Home />
            </div>
            <span className="su-logo-text">Rently</span>
          </Link>
          <Link href="/sign-in" className="su-header-link">
            <User style={{ width: 14, height: 14 }} />
            Нэвтрэх
          </Link>
        </header>

        <main className="su-main">
          <div className="su-left">
            <div className="su-left-top">
              <p className="su-left-eyebrow">Rently — Орон сууцны зах зээл</p>
              <h1 className="su-left-heading">
                Шинэ эхлэл
                <br />
                <em>эхлүүлэх</em>
              </h1>
              <p className="su-left-desc">
                Account үүсгэж орон сууцны зар үзэх, хадгалах болон түрээслэх
                боломжтой болно.
              </p>
            </div>

            <div className="su-left-bottom">
              <ul className="su-features">
                <li className="su-feature">
                  <span className="su-feature-dot" />
                  Баталгаажсан зарууд
                </li>
                <li className="su-feature">
                  <span className="su-feature-dot" />
                  Шууд харилцах боломж
                </li>
                <li className="su-feature">
                  <span className="su-feature-dot" />
                  Аюулгүй гүйлгээ
                </li>
              </ul>
            </div>
          </div>

          <div className="su-right">
            <h2 className="su-right-title">Бүртгүүлэх</h2>
            <p className="su-right-sub">Бүх талбарыг бөглөнө үү</p>

            <form className="su-form" onSubmit={submit} noValidate>
              <div className="su-row">
                <div className="su-field">
                  <label className="su-label">Хэрэглэгчийн нэр</label>
                  <div className="su-input-wrap">
                    <span className="su-input-icon">
                      <User />
                    </span>
                    <input
                      className="su-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="kenomu"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="su-field">
                  <label className="su-label">Хэрэглэгчийн төрөл</label>
                  <div className="su-input-wrap">
                    <span className="su-input-icon">
                      <Shield />
                    </span>
                    <Select
                      value={role}
                      onValueChange={(v) => setRole(v as Role)}
                    >
                      <SelectTrigger className="su-select-trigger">
                        <SelectValue placeholder="Сонгох" />
                      </SelectTrigger>
                      <SelectContent className="su-select-content">
                        <SelectItem value="RENTER" className="su-select-item">
                          Түрээслэгч
                        </SelectItem>
                        <SelectItem value="LANDLORD" className="su-select-item">
                          Түрээслүүлэгч
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="su-row full">
                <div className="su-field">
                  <label className="su-label">Бүтэн нэр</label>
                  <div className="su-input-wrap">
                    <span className="su-input-icon">
                      <User />
                    </span>
                    <input
                      className="su-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Болд Баатар"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="su-row">
                <div className="su-field">
                  <label className="su-label">Имэйл</label>
                  <div className="su-input-wrap">
                    <span className="su-input-icon">
                      <Mail />
                    </span>
                    <input
                      className="su-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                  </div>
                </div>

                <div className="su-field">
                  <label className="su-label">Утасны дугаар</label>
                  <div className="su-input-wrap">
                    <span className="su-input-icon">
                      <Phone />
                    </span>
                    <input
                      className="su-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99112233"
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="su-row">
                <div className="su-field">
                  <label className="su-label">Нууц үг</label>
                  <div className="su-input-wrap">
                    <span className="su-input-icon">
                      <Lock />
                    </span>
                    <input
                      className="su-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8+ тэмдэгт"
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      className="su-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="su-strength">
                      <div className="su-strength-bars">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="su-strength-bar"
                            style={{
                              background:
                                passwordStrength >= i
                                  ? strengthColor[passwordStrength]
                                  : undefined,
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="su-strength-label"
                        style={{ color: strengthColor[passwordStrength] }}
                      >
                        {strengthLabel[passwordStrength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="su-field">
                  <label className="su-label">Нууц үг баталгаажуулах</label>
                  <div className="su-input-wrap">
                    <span className="su-input-icon">
                      <Lock />
                    </span>
                    <input
                      className="su-input"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Дахин оруулна уу"
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      className="su-eye-btn"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div
                      className="su-match"
                      style={{
                        color:
                          password === confirmPassword ? "#10b981" : "#ef4444",
                      }}
                    >
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle2 /> Нууц үг таарч байна
                        </>
                      ) : (
                        <>
                          <X /> Нууц үг таарахгүй байна
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="su-divider" />

              <button
                type="submit"
                className="su-submit"
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <span className="su-spin" />
                ) : (
                  <>
                    Бүртгүүлэх
                    <ArrowRight />
                  </>
                )}
              </button>

              <p className="su-footer-note">
                Бүртгүүлснээр та манай{" "}
                <Link href="/terms">үйлчилгээний нөхцөл</Link> болон{" "}
                <Link href="/privacy">нууцлалын бодлого</Link>-ыг зөвшөөрсөнд
                тооцно
              </p>
            </form>

            <div className="su-already">
              Аль хэдийн бүртгэлтэй юу? <Link href="/sign-in">Нэвтрэх</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
