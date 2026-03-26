import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
}

interface Intern {
  id: number;
  name: string;
  email: string;
  college: string;
  department: string;
  phone_number: string;
  start_date: string;
}

const GET_MANAGER = gql`
  query GetManager($id: Int!) {
    users_by_pk(id: $id) {
      id
      name
      email
      role
      department_id
      department {
        name
      }
    }
  }
`;

const GET_INTERNS = gql`
  query GetInternsByDepartment($departmentId: Int!) {
    users(
      where: {
        department_id: { _eq: $departmentId }
        role: { _eq: "intern" }
      }
    ) {
      id
      name
      email
      intern {
        college
        phone_number
        start_date
      }
    }
  }
`;

export default async function ManagerPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <div className="alert-error flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Access Denied. Please login first.
        </div>
      </div>
    );
  }

  const userId = Number(session.user.id);

  let manager: User | null = null;
  let interns: Intern[] = [];

  try {
    const managerResult = await client.query({
      query: GET_MANAGER,
      variables: { id: userId },
      fetchPolicy: "network-only",
    });

    const m = (managerResult.data as any)?.users_by_pk;
    if (m) {
      manager = {
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        department: m.department?.name ?? "Unknown",
      };

      const internsResult = await client.query({
        query: GET_INTERNS,
        variables: { departmentId: m.department_id },
        fetchPolicy: "network-only",
      });

      interns = ((internsResult.data as any)?.users ?? []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        department: manager!.department,
        college: u.intern?.college ?? "",
        phone_number: u.intern?.phone_number ?? "",
        start_date: u.intern?.start_date ?? "",
      }));
    }
  } catch {
    return (
      <div className="p-8 text-center">
        Failed to load manager data
      </div>
    );
  }

  if (!manager) {
    return <div className="p-8 text-center">Manager profile not found.</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">

      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          Welcome, {manager.name}
        </h1>

        <p className="text-zinc-500 mt-1">
          Department: {manager.department}
        </p>
      </div>

      <div className="card border-white/10 bg-white/[0.02]">

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">
            Interns in {manager.department}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">College</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Start Date</th>
              </tr>
            </thead>

            <tbody>
              {interns.map((intern) => (
                <tr key={intern.id}>
                  <td className="px-6 py-4">{intern.name}</td>
                  <td className="px-6 py-4">{intern.email}</td>
                  <td className="px-6 py-4">{intern.college}</td>
                  <td className="px-6 py-4">{intern.phone_number}</td>
                  <td className="px-6 py-4">
                    {intern.start_date ? new Date(intern.start_date).toLocaleDateString() : "-"}
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
