"use client";

import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

const roles = ["admin", "manager", "intern"];

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  department_id: number | null;
  created_at: string | null;
}

interface Department {
  id: number;
  name: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [apiError, setApiError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
    department_id: null as number | null,
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data?.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data?.departments || []);
    } catch (err) {
      console.error("Fetch departments error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  // Handle form input changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "department_id" ? (value ? Number(value) : null) : value,
    }));
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setShowAddForm(true);
    setEditingUserId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "manager",
      department_id: user.department_id,
    });
  };

  // Create / Update user
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setApiError("");
    setEmailError("");

    try {
      const method = editingUserId ? "PUT" : "POST";

      const payload: any = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password) payload.password = form.password;
      if (form.department_id !== null) payload.department_id = form.department_id;
      if (editingUserId) payload.id = editingUserId;

      const res = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.toLowerCase().includes("email")) {
          setEmailError(data.error);
        } else {
          setApiError(data.error || "Operation failed");
        }
        return;
      }

      if (editingUserId) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUserId ? { ...u, ...data.user } : u))
        );
      } else {
        setUsers((prev) => [...prev, data.user]);
      }

      setShowAddForm(false);
      setEditingUserId(null);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "manager",
        department_id: null,
      });
    } catch (err) {
      console.error(err);
      setApiError("Something went wrong");
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const name = u.name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  // Table columns
  const columns = [
    { name: "Name", selector: (row: User) => row.name, sortable: true },
    { name: "Email", selector: (row: User) => row.email },
    { name: "Role", selector: (row: User) => row.role },
    {
      name: "Edit",
      cell: (row: User) => (
        <button onClick={() => handleEditUser(row)} className="text-blue-600">Edit</button>
      ),
    },
    {
      name: "Delete",
      cell: (row: User) => (
        <button onClick={() => handleDeleteUser(row.id)} className="text-red-600">Delete</button>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-500">Manage admins, managers and interns</p>
          </div>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingUserId(null); }}
            className="border px-5 py-2 rounded-lg"
          >
            {showAddForm ? "Cancel" : "+ Add User"}
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded mb-4"
        />

        {/* Form */}
        {showAddForm && (
          <form onSubmit={handleSubmitUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} required className="border px-3 py-2 rounded" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleFormChange} required className="border px-3 py-2 rounded" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleFormChange} className="border px-3 py-2 rounded" />
            <select name="role" value={form.role} onChange={handleFormChange} className="border px-3 py-2 rounded">
              {roles.map((r) => (<option key={r}>{r}</option>))}
            </select>
            <select name="department_id" value={form.department_id ?? ""} onChange={handleFormChange} className="border px-3 py-2 rounded">
              <option value="">Department</option>
              {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
            <button type="submit" className="border px-4 py-2 rounded">{createLoading ? (editingUserId ? "Updating..." : "Creating...") : (editingUserId ? "Update" : "Create")}</button>
          </form>
        )}

        {/* Table */}
        <DataTable keyField="id" columns={columns} data={filteredUsers} pagination highlightOnHover progressPending={loading} />
      </div>
    </div>
  );
}