"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Intern Management Reimagined
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Manage your <span className="text-primary italic">Interns</span> with <span className="text-indigo-600">Ease</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            InternHub provides a seamless platform for tracking, managing, and empowering the next generation of talent. Highly scalable and beautifully simple.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!session && (
              <Link href="/login">
                <button className="bg-white text-slate-700 border border-slate-200 px-10 py-4 text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all duration-300">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Everything You Need</h2>
            <div className="h-1.5 w-20 bg-primary/20 rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Role-Based Access",
                desc: "Dedicated dashboards for Admins, Managers, and Interns to ensure everyone has what they need.",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                accent: "text-blue-500 bg-blue-50"
              },
              {
                title: "Department Tracking",
                desc: "Organize interns by department and track their progress throughout the internship period.",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                accent: "text-emerald-500 bg-emerald-50"
              },
              {
                title: "Real-time Updates",
                desc: "Instant synchronization with Hasura GraphQL engine for a responsive and modern experience.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                accent: "text-amber-500 bg-amber-50"
              },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 mb-6 shadow-sm border border-black/5 ${feature.accent}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm font-medium italic">
            © {new Date().getFullYear()} InternHub. Crafted for the future of work.
          </p>
        </div>
      </footer>
    </main>
  );
}

