"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.375rem 0.875rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(255,255,255,0.15)",
        backgroundColor: "rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.75)",
        fontSize: "0.8125rem",
        fontWeight: 500,
        fontFamily: "var(--font-sans)",
        cursor: "pointer",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.13)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
      }}
    >
      Sign Out
    </button>
  );
}
