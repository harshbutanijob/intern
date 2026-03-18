"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import client from "../../lib/apolloClient";
import { gql } from "@apollo/client";
import bcrypt from "bcryptjs";

const REGISTER_USER = gql`
  mutation RegisterUser(
    $name: String!
    $email: String!
    $password: String!
    $role: String!
    $created_at: timestamp!
  ) {
    insert_users_one(
      object: {
        name: $name
        email: $email
        password: $password
        role: $role
        created_at: $created_at
      }
    ) {
      id
      name
      email
      role
      created_at
    }
  }
`;

type RegisterUserResult = {
  insert_users_one: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
};

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const createdAt = new Date().toISOString();
      const hashedPassword = await bcrypt.hash(password, 10);

      const res = await client.mutate<RegisterUserResult>({
        mutation: REGISTER_USER,
        variables: { name: username, email, password: hashedPassword, role, created_at: createdAt },
      });

      if (res.data?.insert_users_one) {
        alert(`Registration successful as ${res.data.insert_users_one.role}`);
        router.push("/login");
      } else if (res.error) {
        setError("Failed to register user. See console for details.");
      } else {
        setError("Failed to register user for unknown reasons");
      }
    } catch (err) {
      console.error("Apollo error:", err);
      setError("Error registering user. Maybe email already exists.");
    } finally {
      setLoading(false);
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
            Join the Platform
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem", lineHeight: 1.75, maxWidth: 310 }}>
            Create your account and get started managing interns effectively.
          </p>

          <div style={{ marginTop: "2.5rem", padding: "1.25rem", borderRadius: "0.75rem", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", lineHeight: 1.7 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                Sign in here
              </Link>
            </p>
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
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "0.375rem" }}>
            Create account
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Fill in your details to register
          </p>

          {error && (
            <div className="alert-error" style={{ marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              onClick={handleRegister}
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.9375rem", marginTop: "0.25rem" }}
            >
              {loading ? "Creating account…" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
