"use client";

import { useEffect, useState } from "react";
import client from "../../lib/apolloClient";
import { gql } from "@apollo/client";
import bcrypt from "bcryptjs";
import { GET_INTERNS, INSERT_INTERN, UPDATE_INTERN, DELETE_INTERN } from "../../lib/queries";

interface Intern {
  id: number;
  name: string;
  email: string;
  college: string;
  department: string;
  phone_number: string;
  start_date: string;
}

const INSERT_USER = gql`
mutation InsertUser($name:String!, $email:String!, $password:String!) {
  insert_users_one(object:{
    name:$name,
    email:$email,
    password:$password,
    role:"intern",
    department:null
  }) {
    id
  }
}
`;

const UPDATE_USER = gql`
mutation UpdateUser($name:String!, $email:String!) {
  update_users(
    where:{email:{_eq:$email}},
    _set:{name:$name}
  ){
    affected_rows
  }
}
`;

const DELETE_USER = gql`
mutation DeleteUser($email:String!) {
  delete_users(where:{email:{_eq:$email}}){
    affected_rows
  }
}
`;

const emptyForm: Omit<Intern, "id"> = {
  name: "", email: "", college: "", department: "", phone_number: "", start_date: "",
};

const formFields: { name: keyof typeof emptyForm; label: string; placeholder: string; type?: string }[] = [
  { name: "name", label: "Name", placeholder: "Full name" },
  { name: "email", label: "Email", placeholder: "intern@college.edu" },
  { name: "college", label: "College", placeholder: "College name" },
  { name: "phone_number", label: "Phone", placeholder: "+1 555 000 0000" },
  { name: "start_date", label: "Start Date", placeholder: "", type: "date" },
];

export default function Interns() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Intern, "id">>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterCollege, setFilterCollege] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchInterns = async () => {
    try {
      const res = await client.query<{ interns: Intern[] }>({
        query: GET_INTERNS,
        fetchPolicy: "network-only",
      });
      setInterns(res.data?.interns ?? []);
      setFilteredInterns(res.data?.interns ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch interns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterns(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async () => {

  // check duplicate email in interns list
  const emailExists = interns.some(
    (i) => i.email.toLowerCase() === form.email.toLowerCase()
  );

  if (!editId && emailExists) {
    setError("Intern with this email already exists");
    return;
  }

  try {

    if (editId) {

      await client.mutate({
        mutation: UPDATE_INTERN,
        variables: { id: editId, ...form }
      });

      await client.mutate({
        mutation: UPDATE_USER,
        variables: {
          name: form.name,
          email: form.email
        }
      });

    } else {

      await client.mutate({
        mutation: INSERT_INTERN,
        variables: { ...form }
      });

      const hashedPassword = await bcrypt.hash(`${form.name}@123`, 10);

      await client.mutate({
        mutation: INSERT_USER,
        variables: {
          name: form.name,
          email: form.email,
          password: hashedPassword
        }
      });

    }

    setForm(emptyForm);
    setEditId(null);
    fetchInterns();

  } catch (err) {
    console.error(err);
    setError("Failed to save intern");
  }
};

  const handleDelete = async (id: number, email: string) => {
  try {

    await client.mutate({
      mutation: DELETE_INTERN,
      variables: { id }
    });

    await client.mutate({
      mutation: DELETE_USER,
      variables: { email }
    });

    fetchInterns();

  } catch (err) {
    console.error(err);
    setError("Failed to delete intern");
  }
};

  const handleEdit = (intern: Intern) => {
    setEditId(intern.id);
    setForm({
      name: intern.name, email: intern.email, college: intern.college,
      department: intern.department, phone_number: intern.phone_number, start_date: intern.start_date,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let filtered = interns;
    if (filterCollege) filtered = filtered.filter((i) => i.college === filterCollege);
    if (filterDepartment) filtered = filtered.filter((i) => i.department === filterDepartment);
    setFilteredInterns(filtered);
  }, [filterCollege, filterDepartment, interns]);

  const colleges = Array.from(new Set(interns.map((i) => i.college))).filter(Boolean);
  const departments = Array.from(new Set(interns.map((i) => i.department))).filter(Boolean);

  if (loading) {
    return <div className="alert-loading"><p>Loading interns…</p></div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 4rem)", backgroundColor: "var(--color-app-bg)" }}>
      {/* Sidebar Filters */}
      <aside style={{
        width: 228,
        flexShrink: 0,
        padding: "1.75rem 1rem",
        borderRight: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "1.25rem", paddingLeft: "0.25rem" }}>
          Filters
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" style={{ paddingLeft: "0.25rem" }}>College</label>
          <select
            className="form-select"
            value={filterCollege}
            onChange={(e) => setFilterCollege(e.target.value)}
          >
            <option value="">All colleges</option>
            {colleges.map((col) => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ paddingLeft: "0.25rem" }}>Department</label>
          <select
            className="form-select"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((dep) => <option key={dep} value={dep}>{dep}</option>)}
          </select>
        </div>

        {(filterCollege || filterDepartment) && (
          <button
            className="btn-secondary btn-sm"
            style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}
            onClick={() => { setFilterCollege(""); setFilterDepartment(""); }}
          >
            Clear filters
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "1.75rem 2rem", overflow: "auto" }}>
        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h1 className="page-title">Interns List</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {filteredInterns.length} intern{filteredInterns.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: "1.25rem" }}>{error}</div>
        )}

        {/* Add / Edit Form Card */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1.125rem" }}>
            {editId ? "Edit Intern" : "Add New Intern"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "1rem" }}>
            {formFields.map(({ name, label, placeholder, type }) => (
              <div key={name}>
                <label className="form-label">{label}</label>
                <input
                  name={name}
                  type={type ?? "text"}
                  className="form-input"
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {/* Department Dropdown */}
            <div>
              <div>
                <label className="form-label">Department</label>
                <select
                  name="department"
                  className="form-select"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  <option value="PHP">PHP</option>
                  <option value="Dotnet">Dotnet</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
           <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Saving..." : editId ? "Update Intern" : "Add Intern"}
            </button>
            {editId && (
              <button
                className="btn-secondary"
                onClick={() => { setEditId(null); setForm(emptyForm); }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Interns Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 className="section-title">All Interns</h2>
            {(filterCollege || filterDepartment) && (
              <span className="badge badge-primary">Filtered</span>
            )}
          </div>

          {filteredInterns.length === 0 ? (
            <p style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
              No interns found. Add one above.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Email", "College",  "Phone","Department", "Start Date", "Actions"].map((h) => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInterns.map((intern) => (
                    <tr key={intern.id} className="table-row">
                      <td className="table-td" style={{ fontWeight: 500 }}>{intern.name}</td>
                      <td className="table-td" style={{ color: "var(--color-text-secondary)" }}>{intern.email}</td>
                      <td className="table-td">{intern.college}</td>
                      <td className="table-td">
                        <span className="badge badge-primary">{intern.department}</span>
                      </td>
                      <td className="table-td" style={{ color: "var(--color-text-secondary)" }}>{intern.phone_number}</td>
                       <td className="table-td" style={{ color: "var(--color-text-secondary)" }}>{intern.department}</td>
                      <td className="table-td" style={{ color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{intern.start_date}</td>
                      <td className="table-td">
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn-secondary btn-sm" onClick={() => handleEdit(intern)}>
                            Edit
                          </button>
                          <button className="btn-danger btn-sm" onClick={() => handleDelete(intern.id, intern.email)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
