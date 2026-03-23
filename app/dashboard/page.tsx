"use client";

import { useEffect, useState } from "react";

interface DepartmentCount {
  department: string;
  count: number;
}

interface Stats {
  totalUsers: number;
  totalInterns: number;
  departmentCounts: DepartmentCount[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalInterns: 0,
    departmentCounts: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");

        if (!res.ok) throw new Error("Failed to fetch stats");

        const data: Stats = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-zinc-400 text-lg">
        Loading dashboard...
      </div>
    );
  }

  const today = new Date().toLocaleDateString();

  return (
    <div className="p-8 max-w-7xl mx-auto ">

      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-1">{today}</p>
      </div>

      {/* STATS CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

        {/* USERS CARD */}

        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] shadow-lg hover:scale-[1.02] transition">

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm ">Total Users</p>
              <h2 className="text-4xl font-bold mt-2">
                {stats.totalUsers}
              </h2>
            </div>

            <div className="text-4xl text-indigo-400">
              👤
            </div>
          </div>

        </div>

        {/* INTERNS CARD */}

        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] shadow-lg hover:scale-[1.02] transition">

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm ">Total Interns</p>
              <h2 className="text-4xl font-bold mt-2">
                {stats.totalInterns}
              </h2>
            </div>

            <div className="text-4xl text-purple-400">
              🎓
            </div>
          </div>

        </div>

      </div>

      {/* DEPARTMENT TABLE */}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">

        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            Interns by Department
          </h2>
        </div>

        <table className="w-full text-left">

          <thead className="bg-white/[0.03]  text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3 text-right">Interns</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">

            {stats.departmentCounts.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-8 ">
                  No department data available
                </td>
              </tr>
            ) : (
              stats.departmentCounts.map((d) => (
                <tr
                  key={d.department}
                  className="hover:bg-white/[0.03] transition"
                >
                  <td className="px-6 py-4 font-medium">
                    {d.department}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1  text-sm font-medium">
                      {d.count}
                    </span>
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}