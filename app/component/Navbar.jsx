
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { data: session, status } = useSession();
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: "4rem",
      backgroundColor: "var(--color-nav)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
    }}>
      {/* Brand */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "0.5rem",
          backgroundColor: "var(--color-primary)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontSize: "0.8125rem", fontWeight: 700 }}>IM</span>
        </div>
        <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Intern Management
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {status === "authenticated" && session?.user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: "var(--color-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: "0.8125rem", fontWeight: 600 }}>{initial}</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name}
              </span>
            </div>
            <LogoutButton />
          </>
        ) : (
          <Link href="/login">
            <button className="btn-primary btn-sm">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}