import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

// ================= MANAGER QUERY =================
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

// ================= INTERNS QUERY =================
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

      department {
        name
      }

      intern {
        college
        phone_number
        start_date
      }
    }
  }
`;

// ================= TYPES =================
interface Manager {
  id: number;
  name: string;
  email: string;
  role: string;
  department_id: number;
  department: { name: string };
}

interface GetManagerResponse {
  users_by_pk: Manager | null;
}

interface InternUser {
  id: number;
  name: string;
  email: string;
  department: { name: string };
  intern: {
    college: string;
    phone_number: string;
    start_date: string;
  } | null;
}

interface GetInternsResponse {
  users: InternUser[];
}

// ================= API =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));

    if (!userId) {
      return NextResponse.json(
        { error: "UserId required" },
        { status: 400 }
      );
    }

    // ===== Fetch Manager =====
    const managerResult = await client.query<GetManagerResponse>({
      query: GET_MANAGER,
      variables: { id: userId },
      fetchPolicy: "network-only",
    });

    const managerData = managerResult.data?.users_by_pk;

    if (!managerData) {
      return NextResponse.json(
        { error: "Manager not found" },
        { status: 404 }
      );
    }

    // ===== Fetch Interns =====
    const internsResult = await client.query<GetInternsResponse>({
      query: GET_INTERNS,
      variables: { departmentId: managerData.department_id },
      fetchPolicy: "network-only",
    });

    const internsRaw = internsResult.data?.users || [];

    // ===== Flatten Intern Data =====
    const interns = internsRaw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.department.name,
      college: u.intern?.college ?? "",
      phone_number: u.intern?.phone_number ?? "",
      start_date: u.intern?.start_date ?? "",
    }));

    // ===== Flatten Manager =====
    const manager = {
      id: managerData.id,
      name: managerData.name,
      email: managerData.email,
      role: managerData.role,
      department: managerData.department.name,
    };

    return NextResponse.json({
      manager,
      interns,
    });

  } catch (err) {
    console.error("Manager API error:", err);

    return NextResponse.json(
      { error: "Failed to fetch manager data" },
      { status: 500 }
    );
  }
}