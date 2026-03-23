"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Intern {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  department_id: number | null;
  created_at: string | null;
  college: string;
  phone_number: string;
  start_date: string;
}

interface Department {
  id: number;
  name: string;
}

export default function InternDashboard() {
  const [intern, setIntern] = useState<Intern | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    college: "",
    phone_number: "",
    start_date: "",
  });

  // ---------- FETCH DATA ----------


  useEffect(() => {
  const loadData = async () => {
    try {
      const internRes = await fetch("/api/interns");
      const internData = await internRes.json();

      const deptRes = await fetch("/api/departments");
      const deptData = await deptRes.json();

      setDepartments(deptData.departments || []);

      if (internData?.length > 0) {
        const userIntern = internData[0];

        setIntern(userIntern);

        setForm({
          college: userIntern.college || "",
          phone_number: userIntern.phone_number || "",
          start_date: userIntern.start_date || "",
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  loadData();
}, []);

  // ---------- GET DEPARTMENT NAME ----------
  const getDepartmentName = (id: number | null) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : "Not Assigned";
  };

  // ---------- HANDLE FORM ----------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------- UPDATE ----------
  const handleUpdate = async () => {
  if (!intern) return;

  setLoading(true);

  try {
    const res = await fetch("/api/interns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: intern.user_id,
        college: form.college,
        phone_number: form.phone_number,
        start_date: form.start_date,
      }),
    });

    const updated = await res.json();

    if (!updated?.error) {
      alert("Profile updated successfully");
      window.location.reload();
      setEditing(false);
         // ✅ refresh page
    } else {
      alert("Update failed");
    }
  } catch (err) {
    console.error("Update error:", err);
  }

  setLoading(false);
};

  if (!intern) {
    return (
      <div className="p-8 text-center">
        <p>Loading intern data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Intern Dashboard</h1>

      {/* Profile Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded p-6">

        <div>
          <p className="text-gray-500 text-sm">Name</p>
          <p className="font-medium">{intern.name}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-medium">{intern.email}</p>
        </div>

        {/* College */}
        <div>
          <p className="text-gray-500 text-sm">College</p>

          {editing ? (
            <input
              name="college"
              value={form.college}
              onChange={handleChange}
              className="border rounded px-3 py-1 w-full"
            />
          ) : (
            <p className="font-medium">{intern.college}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <p className="text-gray-500 text-sm">Phone</p>

          {editing ? (
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="border rounded px-3 py-1 w-full"
            />
          ) : (
            <p className="font-medium">{intern.phone_number}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <p className="text-gray-500 text-sm">Start Date</p>

          {editing ? (
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="border rounded px-3 py-1 w-full"
            />
          ) : (
             <p className="text-gray-800">
                {intern.start_date
                  ? new Date(intern.start_date).toLocaleDateString()
                  : "-"}
              </p>
          )}
        </div>

        {/* Department Name */}
        <div>
          <p className="text-gray-500 text-sm">Department</p>
          <p className="font-medium">
            {getDepartmentName(intern.department_id)}
          </p>
        </div>

      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => setEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}