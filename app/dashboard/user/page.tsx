"use client";

import { useEffect, useState } from "react";

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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
  });

  // ---------------- FETCH DATA ----------------

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
        console.error(err);
      }
    };

    loadData();
  }, []);

  // ---------------- GET DEPARTMENT NAME ----------------

  const getDepartmentName = (id: number | null) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : "Not Assigned";
  };

  // ---------------- HANDLE FORM ----------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- UPDATE PROFILE ----------------

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

      const data = await res.json();

      if (!data.error) {
        alert("Profile updated successfully");
        window.location.reload();
      } else {
        alert("Update failed");
      }

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // ---------------- CHANGE PASSWORD ----------------

  const handlePasswordChange = async () => {

    if (!intern) return;

    if (!passwordForm.current_password || !passwordForm.new_password) {
      alert("Fill all fields");
      return;
    }

    setPasswordLoading(true);

    try {

      const res = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: intern.user_id,
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Password updated successfully");
        setShowPasswordModal(false);

        setPasswordForm({
          current_password: "",
          new_password: "",
        });

      } else {
        alert(data.error || "Password update failed");
      }

    } catch (err) {
      console.error(err);
    }

    setPasswordLoading(false);
  };

  // ---------------- LOADING ----------------

  if (!intern) {
    return (
      <div className="p-8 text-center">
        Loading intern data...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Intern Dashboard
      </h1>

      {/* PROFILE CARD */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow rounded p-6">

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
            <p>
              {intern.start_date
                ? new Date(intern.start_date).toLocaleDateString()
                : "-"}
            </p>
          )}

        </div>

        {/* Department */}

        <div>
          <p className="text-gray-500 text-sm">Department</p>
          <p className="font-medium">
            {getDepartmentName(intern.department_id)}
          </p>
        </div>

      </div>

      {/* BUTTONS */}

      <div className="mt-6 flex gap-4 flex-wrap">

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

        <button
          onClick={() => setShowPasswordModal(true)}
          className=" text-black px-4 py-2 rounded"
        >
          Change Password
        </button>

      </div>

      {/* PASSWORD MODAL */}

      {showPasswordModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg w-96 shadow">

            <h2 className="text-lg font-semibold mb-4">
              Change Password
            </h2>

            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  current_password: e.target.value,
                })
              }
              className="border p-2 w-full mb-3 rounded"
            />

            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  new_password: e.target.value,
                })
              }
              className="border p-2 w-full mb-4 rounded"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-black rounded"
              >
                Cancel
              </button>

              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                className="px-4 py-2 text-black rounded"
              >
                {passwordLoading ? "Updating..." : "Update"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}