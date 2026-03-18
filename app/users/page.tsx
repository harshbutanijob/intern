"use client";

import { useEffect, useState } from "react";
import client from "../../lib/apolloClient";
import { GET_ALL_USERS, UPDATE_USER_ROLE } from "../../lib/queries";
import {User} from "../../types/user";

const roles = ["admin", "intern", "manager"]; // define allowed roles

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

      // update local state
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

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin: Manage Users</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={tdStyle}>{user.id}</td>
              <td style={tdStyle}>{user.name}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.role}</td>
              <td style={tdStyle}>
                <select
                  value={user.role}
                  disabled={updatingId === user.id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  {roles.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
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
  );
}

const thStyle = { border: "1px solid #ccc", padding: "8px" };
const tdStyle = { border: "1px solid #ccc", padding: "8px" };