"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const role = session?.user?.role;

  const isActive = (path: string) => pathname === path;

  const dashboardLink = {
    name: "Dashboard",
    href: "/dashboard",
    show: status === "authenticated",
  };

  const dropdownLinks = [
    { name: "Manage Users", href: "/admin/users", show: role === "admin" },
    { name: "Manage Interns", href: "/admin/interns", show: role === "admin" },
    
    { name: "Manage Department", href: "/admin/department", show: role === "admin" },
    { name: "Assign Task", href: "/manager/tasks", show: role === "manager" },
    { name: "Tasks", href: "/interns/tasks", show: role === "intern" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 transition-all group-hover:shadow-md group-hover:shadow-primary/20">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span className="text-slate-900 text-lg font-bold tracking-tight">
          InternHub
        </span>
      </Link>

      {/* Right side */}
      <div className="hidden md:flex items-center gap-4">
        {/* Dashboard Link */}
        {dashboardLink.show && (
          <Link
            href={dashboardLink.href}
            className={`text-sm font-semibold transition-colors hover:text-primary ${
              isActive(dashboardLink.href) ? "text-primary" : "text-slate-600"
            }`}
          >
            {dashboardLink.name}
          </Link>
        )}

        {/* Dropdown */}
        {dropdownLinks.some((link) => link.show) && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="text-sm font-semibold text-slate-600 cursor-pointer focus:text-primary"
            >
              Manage
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md border border-slate-200">
                {dropdownLinks
                  .filter((link) => link.show)
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {status === "authenticated" && session?.user ? (
          <div className="flex items-center gap-4">
            <LogoutButton />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                <span className="text-primary text-sm font-bold">
                  {initial}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-slate-900 text-sm font-semibold leading-none">
                  {session.user.name}
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                  {role}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
            {pathname !== "/" && (
              <Link
                href="/"
                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Home
              </Link>
            )}
            {pathname !== "/login" && (
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
