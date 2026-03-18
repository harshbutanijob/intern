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
    return <h2>Access Denied. Please login first.</h2>;
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
    return <h2>No intern data found for user {session.user.name}</h2>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Welcome {intern.name}</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>Email</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.email}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>College</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.college}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>Department</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.department}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>Phone</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.phone_number}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>Start Date</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{intern.start_date}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}