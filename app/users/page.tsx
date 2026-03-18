"use client";

import { useEffect, useState } from "react";
import client from "../../lib/apolloClient";
import { GET_ALL_USERS, UPDATE_USER_ROLE } from "../../lib/queries";
import { User } from "../../types/user";
import { gql } from "@apollo/client";
import bcrypt from "bcryptjs";

const roles = ["admin", "manager", "user"]; // define allowed roles

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!, $role: String!, $created_at: timestamp!) {
    insert_users_one(object: { name: $name, email: $email, password: $password, role: $role, created_at: $created_at }) {
      id
      name
      email
      role
    }
  }
`;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // New user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("manager");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await client.query<{ users: User[] }>({
        query: GET_ALL_USERS,
        fetchPolicy: "network-only",
      });
      setUsers(res.data?.users ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await client.mutate({
        mutation: UPDATE_USER_ROLE,
        variables: { id: userId, role: newRole },
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const createdAt = new Date().toISOString();

      const res = await client.mutate<{ insert_users_one: User }>({
        mutation: CREATE_USER,
        variables: {
          name: newName,
          email: newEmail,
          password: hashedPassword,
          role: newRole,
          created_at: createdAt,
        },
      });

      if (res.data?.insert_users_one) {
        setUsers((prev) => [...prev, res.data!.insert_users_one]);
        setShowAddForm(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create user. Email might already exist.");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-zinc-400 mt-1">Manage platform access and roles for all users.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showAddForm ? "Cancel" : "Add New User"}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-8 border-white/10 bg-white/[0.02] animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold text-white mb-6">Create New User</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="form-label mb-1.5 block">Full Name</label>
              <input
                type="text"
                className="form-input bg-white/5 border-white/10 text-white"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label mb-1.5 block">Email</label>
              <input
                type="email"
                className="form-input bg-white/5 border-white/10 text-white"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label mb-1.5 block">Password</label>
              <input
                type="password"
                className="form-input bg-white/5 border-white/10 text-white"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label mb-1.5 block">Role</label>
              <div className="flex gap-2">
                <select
                  className="form-select bg-white/5 border-white/10 text-white flex-1"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r} value={r} className="bg-nav text-white">{r}</option>
                  ))}
                </select>
                <button 
                  type="submit" 
                  disabled={createLoading}
                  className="btn-primary"
                >
                  {createLoading ? "..." : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="alert-error mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="card overflow-hidden border-white/10 bg-white/[0.02] p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03]">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5 text-center">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-500 text-center">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-primary/20 text-primary' : 
                      user.role === 'manager' ? 'bg-amber-500/20 text-amber-500' : 
                      'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-zinc-300 outline-none focus:border-primary/50"
                      value={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {roles.map((roleOption) => (
                        <option key={roleOption} value={roleOption} className="bg-nav">
                          {roleOption}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}