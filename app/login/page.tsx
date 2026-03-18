"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const features = [
  "Centralized intern directory",
  "Department-wise tracking",
  "Role-based access control",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      const session = await fetch("/api/auth/session").then((r) => r.json());
      const role = session?.user?.role;
      if (role === "admin") router.push("/dashboard");
      else if(role === "manager") router.push("/dashboard/manager");
      else router.push("/dashboard/user");
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "stretch" }}>
      {/* Left Branding Panel */}
      <div style={{
        flex: "0 0 44%",
        backgroundColor: "var(--color-nav)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3rem 3.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", backgroundColor: "var(--color-primary)", opacity: 0.09, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", backgroundColor: "var(--color-primary)", opacity: 0.07, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "0.75rem",
            backgroundColor: "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.75rem",
          }}>
            <span style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700 }}>IM</span>
          </div>

          <h1 style={{
            color: "#ffffff", fontSize: "2rem", fontWeight: 700,
            letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: "1rem",
          }}>
            Intern Management<br />Platform
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem", lineHeight: 1.75, maxWidth: 310 }}>
            Streamline your intern onboarding, tracking, and management all in one place.
          </p>

          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  backgroundColor: "var(--color-success)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ color: "#fff", fontSize: "0.6875rem", fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem",
        backgroundColor: "var(--color-app-bg)",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "0.375rem" }}>
            Welcome back
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div className="alert-error" style={{ marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.9375rem", marginTop: "0.25rem" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.75rem", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
