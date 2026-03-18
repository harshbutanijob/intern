"use client";

import { useEffect, useState } from "react";
import client from "../../lib/apolloClient";
import { gql } from "@apollo/client";
import Link from "next/link";

const GET_STATS = gql`
  query GetStats {
    interns_aggregate {
      aggregate {
        count
      }
    }
    users_aggregate {
      aggregate {
        count
      }
    }
    interns {
      department
    }
  }
`;

interface Intern {
  department: string;
}

interface StatsQueryResult {
  interns_aggregate: { aggregate: { count: number } };
  users_aggregate: { aggregate: { count: number } };
  interns: Intern[];
}

interface Stats {
  totalInterns: number;
  totalUsers: number;
  departmentCounts: { department: string; count: number }[];
}

const statCards = [
  { key: "totalUsers", label: "Total Users", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )},
  { key: "totalInterns", label: "Total Interns", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )},
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await client.query<StatsQueryResult>({
          query: GET_STATS,
          fetchPolicy: "network-only",
        });

        const totalInterns = res.data?.interns_aggregate.aggregate.count ?? 0;
        const totalUsers = res.data?.users_aggregate.aggregate.count ?? 0;

        const depMap: Record<string, number> = {};
        res.data?.interns.forEach((i) => {
          if (i.department) depMap[i.department] = (depMap[i.department] || 0) + 1;
        });
        const departmentCounts = Object.keys(depMap).map((dep) => ({
          department: dep,
          count: depMap[dep],
        }));

        setStats({ totalInterns, totalUsers, departmentCounts });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="alert-error max-w-lg mx-auto flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ key, label, color, bg, border, icon }) => (
          <div
            key={key}
            className={`card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border-white/10 bg-white/[0.02]`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                {icon}
              </div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-end justify-between">
              <h3 className={`text-4xl font-bold text-white tracking-tighter`}>
                {stats?.[key as keyof Stats] as number ?? 0}
              </h3>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-30 ${bg.replace('/10', '')}`} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Table */}
        <div className="card lg:col-span-2 p-0 border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <h2 className="text-lg font-semibold text-white">Interns by Department</h2>
            <span className="badge bg-primary/20 text-primary border border-primary/10">
              {stats?.departmentCounts.length ?? 0} Departments
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {!stats || stats.departmentCounts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-zinc-500">No department data available yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Interns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.departmentCounts.map((d) => (
                    <tr key={d.department} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{d.department}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold ring-1 ring-emerald-500/20">
                          {d.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <div className="card border-white/10 bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <Link href="/interns" className="block">
                <button className="btn-primary w-full justify-center h-11">
                  Manage Interns
                </button>
              </Link>
              <Link href="/users" className="block">
                <button className="btn-secondary w-full justify-center h-11 border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Manage Users
                </button>
              </Link>
            </div>
          </div>

          <div className="card border-emerald-500/10 bg-emerald-500/[0.02] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
              </svg>
            </div>
            <h4 className="text-emerald-500 text-sm font-bold uppercase tracking-wider mb-2">Pro Tip</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Use the User Management screen to promote interns to managers or create new administrative accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

