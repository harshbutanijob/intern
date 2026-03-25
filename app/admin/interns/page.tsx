"use client";

import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

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

const [search, setSearch] = useState("");

  const columns = [
    {
      name: "Name",
      selector: (row: InternWithUser) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: InternWithUser) => row.email,
    },
    {
      name: "College",
      selector: (row: InternWithUser) => row.college,
    },
    {
      name: "Department",
      selector: (row: InternWithUser) => getDeptName(row.department_id),
    },
    {
      name: "Phone",
      selector: (row: InternWithUser) => row.phone_number,
    },
    {
      name: "Start Date",
      selector: (row: InternWithUser) =>
        row.start_date
          ? new Date(row.start_date).toLocaleDateString()
          : "-",
    },
  ];

  const filteredData = filteredInterns.filter((item: InternWithUser) =>
    item.name.toLowerCase().includes(search.toLowerCase()));

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
        <div className="card border-white/10 bg-white/[0.02] p-4">

          {/* Search */}
          <input
            type="text"
            placeholder="Search Intern..."
            className="mb-4 px-3 py-2 border rounded-md w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            responsive
          />

        </div>
      </div>
    </div>
  );
}
