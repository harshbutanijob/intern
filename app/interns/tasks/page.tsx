"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Task = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
};

export default function InternTasks() {

  const { data: session, status } = useSession();

  const internId = session?.user?.id
    ? Number(session.user.id)
    : null;

  const [tasks, setTasks] = useState<Task[]>([]);

  async function loadTasks() {

    if (!internId) return;

    const res = await fetch(`/api/tasks/intern/${internId}`);

    if (!res.ok) {
      console.error("Failed to fetch tasks");
      return;
    }

    const data = await res.json();
    setTasks(data);
  }

  async function updateStatus(id: number, status: string) {

    await fetch("/api/tasks/status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    loadTasks();
  }

  useEffect(() => {
    if (internId) {
      loadTasks();
    }
  }, [internId]);

  if (status === "loading") return <p>Loading session...</p>;

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        My Tasks
      </h1>

      {tasks.length === 0 ? (
        <p>No tasks assigned</p>
      ) : (

        <div className="overflow-x-auto">

          <table className="w-full border border-gray-200">

            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">Title</th>
                <th className="border p-3 text-left">Description</th>
                <th className="border p-3 text-left">Deadline</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Update</th>
              </tr>
            </thead>

            <tbody>

              {tasks.map((task) => (

                <tr key={task.id} className="hover:bg-gray-50">

                  <td className="border p-3">
                    {task.title}
                  </td>

                  <td className="border p-3">
                    {task.description}
                  </td>

                  <td className="border p-3">
                    {task.deadline}
                  </td>

                  <td className="border p-3 capitalize">
                    {task.status}
                  </td>

                  <td className="border p-3">

                    <select
                      className="border rounded p-1"
                      value={task.status}
                      onChange={(e) =>
                        updateStatus(task.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}