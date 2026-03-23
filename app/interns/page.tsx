"use client";

import { useEffect, useState } from "react";

interface Department {
  id: number;
  name: string;
}

interface InternWithUser {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  department_id: number | null;
  department_name?: string;
  created_at: string | null;
  college: string;
  phone_number: string;
  start_date: string;
}

export default function InternsPage() {
  const [interns, setInterns] = useState<InternWithUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filterCollege, setFilterCollege] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<number | "">("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const internsRes = await fetch("/api/interns");
        const internsData = await internsRes.json();

        const deptRes = await fetch("/api/departments");
        const deptData = await deptRes.json();

        setInterns(internsData || []);
        setDepartments(deptData.departments || []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const filteredInterns = interns.filter(
    (i) =>
      (!filterCollege || i.college === filterCollege) &&
      (!filterDepartment || i.department_id === filterDepartment)
  );

  const getDeptName = (id: number | null) =>
    departments.find((d) => d.id === id)?.name || "-";

  const colleges = Array.from(new Set(interns.map((i) => i.college))).filter(
    Boolean
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <h1 className="text-3xl font-bold">Intern Management</h1>
        <p className="text-zinc-400 mt-1">
          View and manage all registered interns
        </p>
      </div>

      {/* Filters */}
      <div className="card border-white/10 bg-white/[0.02] p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="flex flex-col md:flex-row gap-4">

          {/* College Filter */}
          <select
            value={filterCollege}
            onChange={(e) => setFilterCollege(e.target.value)}
            className="form-select bg-white/5 border-white/10"
          >
            <option value="">All Colleges</option>
            {colleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) =>
              setFilterDepartment(
                e.target.value ? Number(e.target.value) : ""
              )
            }
            className="form-select bg-white/5 border-white/10"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Intern Table */}
      <div className="card overflow-hidden border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr>
                <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                  College
                </th>
                <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                  Start Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">

              {filteredInterns.map((i) => (
                <tr key={i.user_id} className="hover:bg-white/[0.03]">

                  <td className="px-6 py-4">{i.name}</td>
                  <td className="px-6 py-4">{i.email}</td>
                  <td className="px-6 py-4">{i.college}</td>
                  <td className="px-6 py-4">{getDeptName(i.department_id)}</td>
                  <td className="px-6 py-4">{i.phone_number}</td>
                  <td className="px-6 py-4">
                    {i.start_date ? new Date(i.start_date).toLocaleDateString() : "-"}
                  </td>

                </tr>
              ))}

              {filteredInterns.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-zinc-400"
                  >
                    No interns found
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}