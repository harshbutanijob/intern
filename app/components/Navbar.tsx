"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const role = session?.user?.role;

  const isActive = (path: string) => pathname === path;


  const navLinks = [
    { name: "Dashboard", href: "/dashboard", show: status === "authenticated" },
    { name: "Manage Users", href: "/users", show: role === "admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 no-underline group">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 transition-all group-hover:shadow-md group-hover:shadow-primary/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-slate-900 text-lg font-bold tracking-tight">
          InternHub
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.filter(link => link.show).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-semibold transition-colors hover:text-primary ${
              isActive(link.href) ? "text-primary" : "text-slate-600"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {status === "authenticated" && session?.user? (
          
          <div className="flex items-center gap-4">
            <LogoutButton />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                <span className="text-primary text-sm font-bold">{initial}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-slate-900 text-sm font-semibold leading-none">{session.user.name}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">{role}</p>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
            {pathname !== "/" && (
              <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                Home
              </Link>
            )}
            {pathname !== "/login" && (
              <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                Login
              </Link>
            )}
            
          </div>
        )}
      </div>
    </nav>
  );
}