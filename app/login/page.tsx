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

          
        </div>
      </div>
    </div>
  );
}
