import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

const GET_USER_WITH_INTERN = gql`
  query GetUserWithIntern($id: Int!) {
    users_by_pk(id: $id) {
      id
      name
      email
      role
      department_id
      created_at
      intern {
        id
        user_id
        college
        phone_number
        start_date
      }
    }
  }
`;

interface QueryResponse {
  users_by_pk: {
    id: number;
    name: string;
    email: string;
    role: string;
    department_id: number | null;
    created_at: string | null;
    intern?: {
      id: number;
      user_id: number;
      college: string | null;
      phone_number: string | null;
      start_date: string | null;
    } | null;
  } | null;
}



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "", 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const res = await client.query<QueryResponse>({
      query: GET_USER_WITH_INTERN,
      variables: { id: userId },
      fetchPolicy: "network-only",
    });

    const user = res.data?.users_by_pk;

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const intern = user.intern;

    const combined = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      created_at: user.created_at,

      intern_id: intern?.id ?? null,
      user_id: intern?.user_id ?? null,
      college: intern?.college ?? null,
      phone_number: intern?.phone_number ?? null,
      start_date: intern?.start_date ?? null,
    };

    return NextResponse.json(combined);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}