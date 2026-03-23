import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

const GET_USERS = gql`
  query GetAllUsers {
    users {
      id
      name
      email
      role
      department_id
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
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: Int!, $changes: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      role
      department_id
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

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department_id: number | null;
}

// GET Users
export async function GET() {
  try {
    const { data } = await client.query<{ users: User[] }>({
      query: GET_USERS,
      fetchPolicy: "network-only",
    });
    return NextResponse.json({ users: data?.users ?? [] });
  } catch (err) {
    console.error("GET /users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// CREATE User
export async function POST(req: Request) {
  try {

    const body: Omit<User, "id"> & { password: string } = await req.json();

    const { data } = await client.mutate<{ insert_users_one: User }>({
      mutation: INSERT_USER,
      variables: { object: body },
    });

    const createdUser = data?.insert_users_one;

    // If user is intern → create interns record
    if (createdUser?.role === "intern") {

      await client.mutate({
        mutation: INSERT_INTERN,
        variables: {
          object: {
            user_id: createdUser.id
          }
        }
      });

    }

    return NextResponse.json({ user: createdUser });

  } catch (err) {

    console.error("POST /users error:", err);

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );

  }
}
// UPDATE User
export async function PUT(req: Request) {
  try {
    const body: { id: number; role?: string; department_id?: number | null } =
      await req.json();
    const { id, ...changes } = body;

    const { data } = await client.mutate<{ update_users_by_pk: User }>({
      mutation: UPDATE_USER,
      variables: { id, changes },
    });

    return NextResponse.json({ user: data?.update_users_by_pk });
  } catch (err) {
    console.error("PUT /users error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE User
export async function DELETE(req: Request) {
  try {
    const body: { id: number } = await req.json();
    const { data } = await client.mutate<{ delete_users_by_pk: { id: number } }>({
      mutation: DELETE_USER,
      variables: { id: body.id },
    });
    return NextResponse.json({ id: data?.delete_users_by_pk.id });
  } catch (err) {
    console.error("DELETE /users error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}