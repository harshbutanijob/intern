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

  if (!session?.user) return <h2>Access Denied. Please login first.</h2>;

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
  });
  const manager = managerResult.data?.users_by_pk;
  if (!manager) return <h2>Manager not found</h2>;

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
  });
  const interns = internsResult.data?.interns;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Manager Info */}
      <h1>Welcome, {manager.name}</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>Email</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{manager.email}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>Department</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{manager.department}</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: "20px 0" }} />

      {/* Interns List */}
      <h2>Interns in your department</h2>
      {interns?.length === 0 ? (
        <p>No interns found in your department.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Email</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>College</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Phone</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Start Date</th>
            </tr>
          </thead>
          <tbody>
            {interns?.map((intern) => (
              <tr key={intern.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.name}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.email}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.college}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.phone_number}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.start_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}