"use client";

import { useEffect, useState } from "react";

interface Department {
  id: number;
  name: string;
}

export default function DepartmentManager() {

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptName, setDeptName] = useState("");
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // FETCH DEPARTMENTS
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ADD OR UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deptName.trim()) return;

    setLoading(true);

    try {

      if (editingDeptId) {
        // UPDATE
        const res = await fetch("/api/departments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingDeptId,
            name: deptName,
          }),
        });

        const data = await res.json();

        setDepartments((prev) =>
          prev.map((d) => (d.id === editingDeptId ? data.department : d))
        );

        setEditingDeptId(null);
      } else {
        // CREATE
        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: deptName }),
        });

        const data = await res.json();

        setDepartments((prev) => [...prev, data.department]);
      }

      setDeptName("");

    } catch (err) {
      console.error(err);
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // EDIT BUTTON
  const handleEdit = (dept: Department) => {
    setDeptName(dept.name);
    setEditingDeptId(dept.id);
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Delete department?")) return;

    try {
      await fetch("/api/departments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

return (
  <div className="min-h-screen p-10">

    <div className="max-w-3xl mx-auto">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Department Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add, update and manage departments
          </p>
        </div>

      </div>

      {/* FORM */}

      <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">

          <input
            type="text"
            placeholder="Department name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            className="px-4 py-2 rounded-lg w-full bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-black"
            required
          />

          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
          >
            {loading
              ? editingDeptId
                ? "Updating..."
                : "Adding..."
              : editingDeptId
              ? "Update"
              : "Add"}
          </button>

          {editingDeptId && (
            <button
              type="button"
              onClick={() => {
                setEditingDeptId(null);
                setDeptName("");
              }}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          )}

        </form>

      </div>

      {/* DEPARTMENT LIST */}

      <div className="bg-white rounded-xl shadow-sm">

        {departments.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No departments added yet
          </div>
        )}

        {departments.map((dept) => (
          <div
            key={dept.id}
            className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition"
          >

            <span className="font-medium text-gray-800">
              {dept.name}
            </span>

            <div className="flex gap-5 text-sm">

              <button
                onClick={() => handleEdit(dept)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(dept.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>

  </div>
);
}