import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";
import bcrypt from "bcryptjs";

// ---------------------- GraphQL Queries & Mutations ----------------------
const GET_USERS = gql`
  query GetAllUsers {
    users {
      id
      name
      email
      role
      department_id
      created_at
    }
  }
`;

const INSERT_USER = gql`
  mutation InsertUser($object: users_insert_input!) {
    insert_users_one(object: $object) {
      id
      name
      email
      role
      department_id
      created_at
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: Int!, $changes: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      name
      email
      role
      department_id
      created_at
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    delete_users_by_pk(id: $id) {
      id
    }
  }
`;

const INSERT_INTERN = gql`
  mutation InsertIntern($object: interns_insert_input!) {
    insert_interns_one(object: $object) {
      id
      user_id
    }
  }
`;

const DELETE_INTERN = gql`
  mutation DeleteIntern($user_id: Int!) {
    delete_interns(where: { user_id: { _eq: $user_id } }) {
      affected_rows
    }
  }
`;

const CHECK_EMAIL = gql`
  query CheckEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      email
    }
  }
`;

// ---------------------- GET Users ----------------------
export async function GET() {
  try {
    const { data } = await client.query<{ users: any[] }>({
      query: GET_USERS,
      fetchPolicy: "network-only",
    });
    return NextResponse.json({ users: data?.users ?? [] });
  } catch (err) {
    console.error("GET /users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// ---------------------- CREATE User ----------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();



    // Only include department_id if it's not null
    const insertObject: any = { ...body };
    if (insertObject.department_id === null || insertObject.department_id === undefined) {
      delete insertObject.department_id;
    }

    // Check if email already exists
    const { data: emailData } = await client.query({
      query: CHECK_EMAIL,
      variables: { email: insertObject.email },
      fetchPolicy: "no-cache",
    });

    if ((emailData?.users ?? []).length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Create user
    const { data } = await client.mutate({
      mutation: INSERT_USER,
      variables: { object: insertObject },
    });

    const createdUser = data?.insert_users_one;

    // Add to interns table if role is intern
    if (createdUser?.role === "intern") {
      await client.mutate({
        mutation: INSERT_INTERN,
        variables: { object: { user_id: createdUser.id } },
      });
    }

    return NextResponse.json({ user: createdUser });
  } catch (err) {
    console.error("POST /users error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// ---------------------- UPDATE User ----------------------
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, email, password, role, ...changes } = body;

    // Hash password if provided
    if (password) {
      changes.password = await bcrypt.hash(password, 10);
    }

    // Check email if updated
    if (email) {
      const { data: emailData } = await client.query({
        query: CHECK_EMAIL,
        variables: { email },
        fetchPolicy: "no-cache",
      });
      const existingUser = emailData?.users?.find((u: any) => u.id !== id);
      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      changes.email = email;
    }

    // Remove department_id if null
    if (changes.department_id === null) {
      delete changes.department_id;
    }

    // Fetch the existing user to check old role
    const { data: userData } = await client.query({
      query: gql`
        query GetUser($id: Int!) {
          users_by_pk(id: $id) {
            id
            role
          }
        }
      `,
      variables: { id },
      fetchPolicy: "no-cache",
    });

    const oldRole = userData?.users_by_pk?.role;

    // Update user
    const { data } = await client.mutate({
      mutation: UPDATE_USER,
      variables: { id, changes: { ...changes, role } },
    });

    const updatedUser = data?.update_users_by_pk;

    // Sync interns table
    if (role === "intern" && oldRole !== "intern") {
      // Add to interns if not exists
      const { data: existingIntern } = await client.query({
        query: gql`
          query GetIntern($user_id: Int!) {
            interns(where: { user_id: { _eq: $user_id } }) {
              id
            }
          }
        `,
        variables: { user_id: updatedUser?.id },
        fetchPolicy: "no-cache",
      });

      if ((existingIntern?.interns ?? []).length === 0) {
        await client.mutate({
          mutation: INSERT_INTERN,
          variables: { object: { user_id: updatedUser?.id } },
        });
      }
    } else if (oldRole === "intern" && role !== "intern") {
      // Remove from interns if exists
      await client.mutate({
        mutation: DELETE_INTERN,
        variables: { user_id: updatedUser?.id },
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("PUT /users error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// ---------------------- DELETE User ----------------------
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { data } = await client.mutate({
      mutation: DELETE_USER,
      variables: { id: body.id },
    });
    return NextResponse.json({ id: data?.delete_users_by_pk.id });
  } catch (err) {
    console.error("DELETE /users error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}