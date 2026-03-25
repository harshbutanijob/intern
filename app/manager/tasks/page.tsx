"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Task = {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  deadline: string;
  status: string;
};

type Intern = {
  id: number;
  name: string;
};

export default function ManagerTasks() {

  const { data: session } = useSession();
  const managerId = session?.user?.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    internId: "",
    deadline: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadTasks() {
    const res = await fetch("/api/tasks/manager");
    const data = await res.json();
    setTasks(data);
  }

  async function loadInterns() {

    if (!managerId) return;

    const res = await fetch(`/api/manager?userId=${managerId}`);
    const data = await res.json();

    setInterns(data.interns || []);
  }

  async function saveTask() {

    if (editingId) {

      await fetch("/api/tasks/manager", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: form.title,
          description: form.description,
          deadline: form.deadline,
        }),
      });

    } else {

      await fetch("/api/tasks/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          assigned_to: Number(form.internId),
          assigned_by: managerId,
          deadline: form.deadline,
        }),
      });

    }

    resetForm();
    loadTasks();
  }

  async function deleteTask(id: number) {

    await fetch("/api/tasks/manager", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadTasks();
  }

  function editTask(task: Task) {

    setEditingId(task.id);

    setForm({
      title: task.title,
      description: task.description,
      internId: String(task.assigned_to),
      deadline: task.deadline,
    });
  }

  function resetForm() {

    setEditingId(null);

    setForm({
      title: "",
      description: "",
      internId: "",
      deadline: "",
    });
  }

  useEffect(() => {
    loadTasks();
    loadInterns();
  }, [managerId]);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Manager Task Panel
      </h1>

      {/* Task Form */}

      <div className="grid grid-cols-4 gap-3 mb-6">

        <input
          className="border p-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          className="border p-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        {/* INTERN DROPDOWN */}

        <select
          className="border p-2"
          value={form.internId}
          onChange={(e) =>
            setForm({ ...form, internId: e.target.value })
          }
        >
          <option value="">Select Intern</option>

          {interns.map((intern) => (
            <option key={intern.id} value={intern.id}>
              {intern.name}
            </option>
          ))}

        </select>

        <input
          type="date"
          className="border p-2"
          value={form.deadline}
          onChange={(e) =>
            setForm({ ...form, deadline: e.target.value })
          }
        />

      </div>

      <div className="flex gap-3 mb-6">

        <button
          onClick={saveTask}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update Task" : "Add Task"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}

      </div>

      {/* Task Table */}

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Intern</th>
            <th className="border p-2">Deadline</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>

          {tasks.map((task) => {

            const intern = interns.find(i => i.id === task.assigned_to);

            return (
              <tr key={task.id}>

                <td className="border p-2">{task.title}</td>
                <td className="border p-2">{task.description}</td>

                <td className="border p-2">
                  {intern?.name || task.assigned_to}
                </td>

                <td className="border p-2">{task.deadline}</td>

                <td className="border p-2 capitalize">
                  {task.status}
                </td>

                <td className="border p-2 flex gap-2">

                  <button
                    onClick={() => editTask(task)}
                    className="text-black"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-black"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}