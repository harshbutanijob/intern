"use client";

import { useEffect, useState } from "react";
import bcrypt from "bcryptjs"; // for password hashing

const roles = ["admin", "manager","intern"]; // allowed roles

interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;                   // Primary key
  name: string;                 // User's full name
  email: string;                // Unique email
  password: string;             // Hashed password
  role: string;                 // "admin", "manager", etc.
  department_id: number | null; // Always present, nullable
  created_at: string | null;    // ISO timestamp, optional
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptName, setDeptName] = useState("");
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [editingDeptName, setEditingDeptName] = useState("");
  const [deptLoading, setDeptLoading] = useState(false);


 const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  role: "manager",
  department_id: null as number | null,
});

  // ---------- FETCH USERS ----------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // ---------- FETCH DEPARTMENTS ----------
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
    fetchUsers();
    fetchDepartments();
  }, []);

  // ---------- CREATE USER ----------
  const handleFormChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: name === "department_id" ? (value ? Number(value) : null) : value,
  }));
};

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailExists = users.some(
  (u) => u.email.toLowerCase() === form.email.toLowerCase()
);
    if (emailExists) {
      alert("Email already exists!");
      return;
    }

    setCreateLoading(true);
    try {
      // Hash password before sending
      const hashedPassword = await bcrypt.hash(form.password, 10);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: hashedPassword,
          role: form.role,
          department_id: form.department_id ?? null,
        })
      });

     const data = await res.json();
        if (data.user) {
          setUsers((prev) => [...prev, data.user]);
          setShowAddForm(false);
          setForm({
              name: "",
              email: "",
              password: "",
              role: "manager",
              department_id: null,
            });
        }
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
    } finally {
      setCreateLoading(false);
      
    }
  };

  // ---------- UPDATE USER ----------
// UPDATE USER
const handleUpdateUser = async (userId: number, role: string, department_id: number | null) => {
  setUpdatingId(userId);
  try {
    const res = await fetch(`/api/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role, department_id }),
    });

    if (!res.ok) throw new Error("Failed to update user");
    const data = await res.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u))
    );
  } catch (err) {
    console.error(err);
    alert("Failed to update user");
  } finally {
    setUpdatingId(null);
  }
};

// DELETE USER
const handleDeleteUser = async (userId: number) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    const res = await fetch(`/api/users`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });

    if (!res.ok) throw new Error("Failed to delete user");
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  } catch (err) {
    console.error(err);
    alert("Failed to delete user");
  }
};

  // ---------- ADD DEPARTMENT ----------
const handleAddDepartment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!deptName.trim()) return;

  setDeptLoading(true);
  try {
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deptName }),
    });
    const data = await res.json();

    if (data.department) {
      // Update local state
      setDepartments((prev) => [...prev, data.department]);
      setDeptName(""); // Reset input
    } else if (data.error) {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add department");
  } finally {
    setDeptLoading(false);
  }
};

// ---------- UPDATE DEPARTMENT ----------
const handleUpdateDepartment = async (id: number) => {
  if (!editingDeptName.trim()) return;

  try {
    const res = await fetch("/api/departments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editingDeptName }),
    });

    const data = await res.json();
    if (data.department) {
      // Update local state
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? data.department : d))
      );
      setEditingDeptId(null);
      setEditingDeptName("");
    } else if (data.error) {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to update department");
  }
};

// ---------- DELETE DEPARTMENT ----------
const handleDeleteDepartment = async (id: number) => {
  if (!confirm("Are you sure you want to delete this department?")) return;

  try {
    const res = await fetch("/api/departments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (data.success) {
      // Remove from local state
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } else if (data.error) {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to delete department");
  }
};

  // Map department_id to name
  const getDeptName = (id: number | null) =>
    departments.find((d) => d.id === id)?.name || "-";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-zinc-400 mt-1">Manage platform access and roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DEPARTMENT MANAGEMENT */}
        <div className="lg:col-span-1">
          <div className="card border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-xl font-semibold mb-6">Department Management</h2>
            <form onSubmit={handleAddDepartment} className="flex gap-3 mb-6">
              <input
                type="text"
                className="form-input bg-white/5 border-white/10 flex-1"
                placeholder="Department name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={deptLoading}>
                {deptLoading ? "Adding..." : "Add"}
              </button>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-xs text-zinc-500 uppercase">Department</th>
                    <th className="px-3 py-2 text-xs text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td className="px-3 py-3 text-sm">
                        {editingDeptId === dept.id ? (
                          <input
                            className="form-input bg-white/5 border-white/10"
                            value={editingDeptName}
                            onChange={(e) => setEditingDeptName(e.target.value)}
                          />
                        ) : (
                          dept.name
                        )}
                      </td>
                      <td className="px-3 py-3 flex gap-2 text-sm">
                        {editingDeptId === dept.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateDepartment(dept.id)}
                              className="text-green-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingDeptId(null)}
                              className="text-zinc-400"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingDeptId(dept.id);
                                setEditingDeptName(dept.name);
                              }}
                              className="text-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(dept.id)}
                              className="text-red-500"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* USER MANAGEMENT */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Users</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2"
            >
              {showAddForm ? "Cancel" : "Add User"}
            </button>
          </div>

          {showAddForm && (
        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
        >
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleFormChange}
            className="form-input"
            required
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleFormChange}
            className="form-input"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleFormChange}
            className="form-input"
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleFormChange}
            className="form-select"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            name="department_id"
            value={form.department_id ?? ""}
            onChange={handleFormChange}
            className="form-select"
          >
            <option value="">Select Department</option>

            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary">
            {createLoading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Department</th>
                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Change Role/Dept</th>
                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{getDeptName(user.department_id)}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <select
                          className="bg-white/5 border border-white/10 rounded px-2 py-1"
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateUser(user.id, e.target.value, user.department_id)
                          }
                        >
                          {roles.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <select
                          className="bg-white/5 border border-white/10 rounded px-2 py-1"
                          value={user.department_id ?? ""}
                          onChange={(e) =>
                            handleUpdateUser(
                              user.id,
                              user.role,
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        >
                          <option value="">Select Dept</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}