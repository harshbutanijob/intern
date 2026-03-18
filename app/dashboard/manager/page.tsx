// app/dashboard/manager/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import client from "../../../lib/apolloClient";
import { gql } from "@apollo/client";

// Types
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

type GetManagerResult = { users_by_pk: User | null };
type GetInternsResult = { interns: Intern[] };

export default async function ManagerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="alert-error flex items-center gap-3">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Access Denied. Please login first.
      </div>
    </div>
  );

  // Fetch manager info
  const GET_MANAGER = gql`
    query GetManager($id: Int!) {
      users_by_pk(id: $id) {
        id
        name
        email
        department
        role
      }
    }
  `;
  const managerResult = await client.query<GetManagerResult>({
    query: GET_MANAGER,
    variables: { id: Number(session.user.id) },
    fetchPolicy: "network-only",
  });
  const manager = managerResult.data?.users_by_pk;
  
  if (!manager) return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <h2 className="text-xl font-semibold text-white">Manager not found</h2>
      <p className="text-zinc-500 mt-2">Could not retrieve manager details for this account.</p>
    </div>
  );

  // Fetch interns in same department
  const GET_INTERNS = gql`
    query GetInterns($department: String!) {
      interns(where: { department: { _eq: $department } }) {
        id
        name
        email
        college
        department
        phone_number
        start_date
      }
    }
  `;
  const internsResult = await client.query<GetInternsResult>({
    query: GET_INTERNS,
    variables: { department: manager.department },
    fetchPolicy: "network-only",
  });
  const interns = internsResult.data?.interns;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Manager Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {manager.name}</h1>
          <p className="text-zinc-500 mt-1">Department: <span className="text-primary font-medium">{manager.department}</span></p>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{manager.name.charAt(0)}</span>
           </div>
           <div className="text-left">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Manager Email</p>
              <p className="text-sm text-white font-medium">{manager.email}</p>
           </div>
        </div>
      </div>

      {/* Interns List Card */}
      <div className="card p-0 border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h2 className="text-lg font-semibold text-white">Interns in {manager.department}</h2>
          <span className="badge bg-emerald-500/20 text-emerald-500 border border-emerald-500/10">
            {interns?.length ?? 0} Active Interns
          </span>
        </div>

        <div className="overflow-x-auto">
          {!interns || interns.length === 0 ? (
            <div className="py-20 text-center">
              <svg className="w-12 h-12 text-zinc-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-zinc-500">No interns found in your department.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">College</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6">Phone</th>
                  <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {interns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {intern.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-white">{intern.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{intern.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{intern.college}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{intern.phone_number}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400 text-right">{new Date(intern.start_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-zinc-600 text-xs">
        Data synchronized with Hasura Engine • Role: {manager.role}
      </div>
    </div>
  );
}