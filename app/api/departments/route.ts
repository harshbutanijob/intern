import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

// ------------------- GraphQL Queries & Mutations -------------------

const GET_DEPARTMENTS = gql`
  query GetAllDepartments {
    departments {
      id
      name
    }
  }
`;

const INSERT_DEPARTMENT = gql`
  mutation InsertDepartment($object: departments_insert_input!) {
    insert_departments_one(object: $object) {
      id
      name
    }
  }
`;

const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($id: Int!, $changes: departments_set_input!) {
    update_departments_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      name
    }
  }
`;

const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: Int!) {
    delete_departments_by_pk(id: $id) {
      id
    }
  }
`;

// ------------------- TypeScript Interface -------------------

export interface Department {
  id: number;
  name: string;
}

// ------------------- API Handlers -------------------

// GET Departments
export async function GET() {
  try {
    const { data } = await client.query<{ departments: Department[] }>({
      query: GET_DEPARTMENTS,
      fetchPolicy: "network-only",
    });
    return NextResponse.json({ departments: data?.departments ?? [] });
  } catch (err) {
    console.error("GET /departments error:", err);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

// CREATE Department
export async function POST(req: Request) {
  try {
    const body: Omit<Department, "id"> = await req.json();
    const { data } = await client.mutate<{ insert_departments_one: Department }>({
      mutation: INSERT_DEPARTMENT,
      variables: { object: body },
    });
    return NextResponse.json({ department: data?.insert_departments_one });
  } catch (err) {
    console.error("POST /departments error:", err);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}

// UPDATE Department
export async function PUT(req: Request) {
  try {
    const body: { id: number; name?: string } = await req.json();
    const { id, ...changes } = body;
    const { data } = await client.mutate<{ update_departments_by_pk: Department }>({
      mutation: UPDATE_DEPARTMENT,
      variables: { id, changes },
    });
    return NextResponse.json({ department: data?.update_departments_by_pk });
  } catch (err) {
    console.error("PUT /departments error:", err);
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

// DELETE Department
export async function DELETE(req: Request) {
  try {
    const body: { id: number } = await req.json();
    const { data } = await client.mutate<{ delete_departments_by_pk: { id: number } }>({
      mutation: DELETE_DEPARTMENT,
      variables: { id: body.id },
    });
    return NextResponse.json({ id: data?.delete_departments_by_pk.id });
  } catch (err) {
    console.error("DELETE /departments error:", err);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}