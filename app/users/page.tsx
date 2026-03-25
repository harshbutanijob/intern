"use client";

import { useEffect, useState } from "react";
import bcrypt from "bcryptjs";
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

  /* ---------------- FETCH USERS ---------------- */

  const fetchUsers = async () => {

    setLoading(true);

    try {

      const res = await fetch("/api/users");
      const data = await res.json();

      const cleanUsers = (data?.users || []).filter((u: User) => u && u.id);

      setUsers(cleanUsers);

    } catch (err) {

      console.error("Fetch users error:", err);

    } finally {

      setLoading(false);

    }
  };

  /* ---------------- FETCH DEPARTMENTS ---------------- */

  const fetchDepartments = async () => {

    try {

      const res = await fetch("/api/departments");
      const data = await res.json();

      setDepartments((data?.departments || []).filter(Boolean));

    } catch (err) {

      console.error("Fetch departments error:", err);

    }
  };

  useEffect(() => {

    fetchUsers();
    fetchDepartments();

  }, []);

  /* ---------------- FILTER USERS ---------------- */

  const filteredUsers = users.filter((u) => {

    if (!u) return false;

    const name = u.name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";

    return (
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase())
    );
  });

  /* ---------------- FORM CHANGE ---------------- */

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "department_id" ? (value ? Number(value) : null) : value,
    }));
  };

  /* ---------------- EDIT USER ---------------- */

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

  /* ---------------- CREATE / UPDATE USER ---------------- */

  const handleSubmitUser = async (e: React.FormEvent) => {

    e.preventDefault();

    setCreateLoading(true);
    setEmailError("");
    setApiError("");

    try {

      let hashedPassword = form.password;

      if (form.password) {
        hashedPassword = await bcrypt.hash(form.password, 10);
      }

      const method = editingUserId ? "PUT" : "POST";

      const payload = {
        id: editingUserId,
        name: form.name,
        email: form.email,
        password: hashedPassword,
        role: form.role,
        department_id: form.department_id,
      };

      const res = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      /* ERROR FROM API */

      if (!res.ok) {

        if (data?.error?.toLowerCase().includes("email")) {
          setEmailError(data.error);
        } else {
          setApiError(data.error || "Operation failed");
        }

        return;
      }

      /* SUCCESS */

      if (editingUserId) {

        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUserId ? { ...u, ...data.user } : u
          )
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

  /* ---------------- DELETE USER ---------------- */

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

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    {
      name: "Name",
      selector: (row: User) => row?.name || "",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row: User) => row?.email || "",
    },
    {
      name: "Role",
      selector: (row: User) => row?.role || "",
    },
    {
      name: "Edit",
      cell: (row: User) => (
        <button
          onClick={() => handleEditUser(row)}
          className="text-blue-600"
        >
          Edit
        </button>
      ),
    },
    {
      name: "Delete",
      cell: (row: User) => (
        <button
          onClick={() => handleDeleteUser(row.id)}
          className="text-red-600"
        >
          Delete
        </button>
      ),
    },
  ];

return (
  <div className="min-h-screen bg-white p-10">

    <div className="max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage admins, managers and interns
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingUserId(null);
          }}
          className="flex items-center gap-2 border border-gray-300 hover:border-black hover:shadow-md transition px-5 py-2 rounded-lg font-medium"
        >
          {showAddForm ? "Cancel" : "+ Add User"}
        </button>

      </div>

      {/* SEARCH BAR */}

      <div className="flex justify-between items-center mb-8">

        <div className="relative w-72">

          <input
            type="text"
            placeholder="Search users..."
            className="w-full border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none px-4 py-2 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <p className="text-sm text-gray-500">
          {filteredUsers.length} users
        </p>

      </div>

      {/* FORM CARD */}

      {showAddForm && (

        <div className="border border-gray-200 rounded-xl p-6 mb-10 shadow-sm">

          <h2 className="text-lg font-semibold mb-4">
            {editingUserId ? "Edit User" : "Create User"}
          </h2>

          {apiError && (
            <div className="border border-red-300 text-red-600 px-4 py-2 rounded mb-4">
              {apiError}
            </div>
          )}

          <form
            onSubmit={handleSubmitUser}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >

            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleFormChange}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:border-black outline-none"
              required
            />

            <div>

              <input
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleFormChange}
                className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:border-black outline-none"
                required
              />

              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}

            </div>

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleFormChange}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:border-black outline-none"
            />

            <select
              name="role"
              value={form.role}
              onChange={handleFormChange}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:border-black outline-none"
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <select
              name="department_id"
              value={form.department_id ?? ""}
              onChange={handleFormChange}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:border-black outline-none"
            >
              <option value="">Department</option>

              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}

            </select>

            <button
              type="submit"
              className="border border-black text-black hover:bg-black hover:text-white transition px-4 py-2 rounded-lg font-medium"
            >
              {createLoading
                ? editingUserId
                  ? "Updating..."
                  : "Creating..."
                : editingUserId
                ? "Update"
                : "Create"}
            </button>

          </form>

        </div>
      )}

      {/* TABLE CARD */}

      <div className="border border-gray-200 rounded-xl shadow-sm p-4">

        <DataTable
          keyField="id"
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          responsive
          progressPending={loading}
          striped
          customStyles={{
            headCells: {
              style: {
                fontWeight: "600",
                fontSize: "14px",
                borderBottom: "1px solid #e5e7eb"
              }
            },
            rows: {
              style: {
                minHeight: "60px"
              }
            }
          }}
        />

      </div>

    </div>

  </div>
);
}