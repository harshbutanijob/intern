import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

// ==================== GraphQL Query ====================

const GET_INTERNS = gql`
  query GetInternUsers {
    interns {
      id
      user_id
      college
      phone_number
      start_date
      user {          # matches Hasura relationship
        id
        name
        email
        role
        department_id
        created_at
      }
    }
  }
`;


// PUT / Update intern by ID
const UPDATE_INTERN_BY_USER_ID = gql`
  mutation UpdateInternByUserId(
    $user_id: Int!, 
    $college: String, 
    $phone_number: String, 
    $start_date: date
  ) {
    update_interns(
      where: { user_id: { _eq: $user_id } }, 
      _set: { college: $college, phone_number: $phone_number, start_date: $start_date }
    ) {
      returning {
        id
        user_id
        college
        phone_number
        start_date
      }
    }
  }
`;

// ==================== TypeScript Interfaces ====================

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department_id: number | null;
  created_at: string | null;
}

interface Intern {
  id: number;
  user_id: number;
  college: string;
  phone_number: string;
  start_date: string;
  user: User;   // match relationship name
}


interface UpdateInternResponse {
  update_interns: {
    returning: Intern[];
  };
}



// ==================== API Handler ====================

export async function GET() {
  try {
    const res = await client.query<{ interns: Intern[] }>({
      query: GET_INTERNS,
      fetchPolicy: "network-only",
    });

    // Combine intern + user fields into a single object
    const combined = res.data?.interns.map((i) => ({
      id: i.user?.id,
      name: i.user?.name,
      email: i.user?.email,
      role: i.user?.role,
      department_id: i.user?.department_id,
      created_at: i.user?.created_at,
      user_id: i.user_id,
      college: i.college,
      phone_number: i.phone_number,
      start_date: i.start_date,
    }));

    return NextResponse.json(combined);
  } catch (err) {
    console.error("GET /interns error:", err);
    return NextResponse.json(
      { error: "Failed to fetch interns" },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const { user_id, college, phone_number, start_date } = await req.json();

    const res = await client.mutate<UpdateInternResponse>({
      mutation: UPDATE_INTERN_BY_USER_ID,
      variables: { user_id, college, phone_number, start_date }, // match GraphQL mutation
    });

  
    return NextResponse.json(res.data?.update_interns?.returning[0]);
  } catch (err) {
    console.error("PUT /interns error:", err);
    return NextResponse.json({ error: "Failed to update intern" }, { status: 500 });
  }
}