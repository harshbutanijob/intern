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
        border: "1px solid rgba(227, 29, 29, 0.94)",
        backgroundColor: "rgba(233, 12, 12, 0.92)",
        color: "rgba(255, 255, 255, 0.99)",
        fontSize: "0.8125rem",
        fontWeight: 500,
        fontFamily: "var(--font-sans)",
        cursor: "pointer",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(227, 29, 29, 0.94)";
        e.currentTarget.style.borderColor = "rgba(227, 29, 29, 0.94)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(227, 29, 29, 0.94)";
        e.currentTarget.style.borderColor = "rgba(227, 29, 29, 0.94)";
      }}
    >
      Sign Out
    </button>
  );
}
