import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import client from "../../../lib/apolloClient";
import { gql } from "@apollo/client";

interface Intern {
  id: number;
  name: string;
  email: string;
  college: string;
  department: string;
  phone_number: string;
  start_date: string;
}

// GraphQL query to get intern by name
const GET_INTERN_BY_NAME = gql`
  query GetInternByName($email: String!) {
    interns(where: { email: { _eq: $email } }) {
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

export default async function Dashboard() {
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

  // Fetch intern row from Hasura using session.user.name
  let intern: Intern | null = null;
  try {
    const res = await client.query<{ interns: Intern[] }>({
      query: GET_INTERN_BY_NAME,
      variables: { email: session.user.email },
      fetchPolicy: "network-only",
    });

    intern = res.data?.interns?.[0] ?? null;
  } catch (err) {
    console.error("Error fetching intern:", err);
  }

  if (!intern) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6 text-zinc-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">Profile not found</h2>
        <p className="text-zinc-500 mt-2">No intern data found for user <span className="text-white">{session.user.name}</span></p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {intern.name}</h1>
        <p className="text-zinc-500 mt-1">Intern Portal Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="card border-white/10 bg-white/[0.02] p-8">
             <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Identity Details
             </h3>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                   <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Email Address</p>
                   <p className="text-white font-medium">{intern.email}</p>
                </div>
                <div>
                   <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">College</p>
                   <p className="text-white font-medium">{intern.college}</p>
                </div>
                <div>
                   <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Department</p>
                   <p className="text-white font-medium">{intern.department}</p>
                </div>
                <div>
                   <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Phone Number</p>
                   <p className="text-white font-medium">{intern.phone_number}</p>
                </div>
             </div>
          </div>

          <div className="card border-white/10 bg-white/[0.02] p-8 flex items-center justify-between">
             <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Start Date</p>
                <p className="text-xl font-bold text-white">{new Date(intern.start_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
          </div>
        </div>

        {/* Sidebar / Status */}
        <div className="space-y-6">
           <div className="card border-primary/20 bg-primary/5 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 shadow-lg shadow-primary/10">
                 <span className="text-primary text-2xl font-bold">{intern.name.charAt(0)}</span>
              </div>
              <h4 className="text-white font-bold">{intern.name}</h4>
              <p className="text-zinc-500 text-sm mt-1">Active Intern</p>
              <div className="mt-6 pt-6 border-t border-white/5">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Verified Profile</span>
                 </div>
              </div>
           </div>
           
           <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5">
              <p className="text-zinc-500 text-xs leading-relaxed">
                 Need to update your details? Contact your department manager <span className="text-zinc-400">({intern.department})</span> for any changes to your profile info.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}