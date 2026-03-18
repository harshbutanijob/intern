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
  { key: "totalUsers", label: "Total Users", accent: "var(--color-primary)" },
  { key: "totalInterns", label: "Total Interns", accent: "var(--color-success)" },
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
      <div className="alert-loading">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div className="alert-error">{error}</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{today}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {statCards.map(({ key, label, accent }) => (
          <div
            key={key}
            className="card"
            style={{ borderTop: `3px solid ${accent}`, paddingTop: "1.25rem" }}
          >
            <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
              {label}
            </p>
            <p style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.03em", color: accent, lineHeight: 1 }}>
              {stats?.[key as keyof Stats] as number ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom grid: table + actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "1.25rem", alignItems: "start" }}>
        {/* Department Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 className="section-title">Interns by Department</h2>
            <span className="badge badge-primary">{stats?.departmentCounts.length ?? 0} departments</span>
          </div>
          {stats?.departmentCounts.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              No department data yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="table-th">Department</th>
                  <th className="table-th" style={{ textAlign: "right" }}>Interns</th>
                </tr>
              </thead>
              <tbody>
                {stats?.departmentCounts.map((d) => (
                  <tr key={d.department} className="table-row">
                    <td className="table-td">{d.department}</td>
                    <td className="table-td" style={{ textAlign: "right" }}>
                      <span className="badge badge-success">{d.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <Link href="/interns">
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Manage Interns
              </button>
            </Link>
            <Link href="/users">
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Manage Users
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
