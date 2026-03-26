import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";


type Task = {
  id: number
  title: string
  description: string
  assigned_to: number
  assigned_by: number
  deadline: string
  status: string
}

type GetTasksResponse = {
  tasks: Task[]
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assignedBy = searchParams.get("assignedBy");

    const query = gql`
      query GetTasks($where: tasks_bool_exp!) {
        tasks(where: $where, order_by: { created_at: desc }) {
          id
          title
          description
          assigned_to
          assigned_by
          deadline
          status
        }
      }
    `;

    const where = assignedBy
      ? { assigned_by: { _eq: Number(assignedBy) } }
      : {};

    const response = await client.query<GetTasksResponse>({
      query,
      variables: { where },
      fetchPolicy: "no-cache",
    });

    return NextResponse.json(response.data?.tasks ?? []);
  } catch (err) {
    console.error("GET /tasks/manager error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mutation = gql`
      mutation AddTask(
        $title: String!
        $description: String!
        $assigned_to: Int!
        $assigned_by: Int!
        $deadline: date!
      ) {
        insert_tasks_one(
          object: {
            title: $title
            description: $description
            assigned_to: $assigned_to
            assigned_by: $assigned_by
            deadline: $deadline
            status: "pending"
          }
        ) {
          id
          title
          description
          assigned_to
          assigned_by
          deadline
          status
        }
      }
    `;

    const { data } = await client.mutate({
      mutation,
      variables: body,
    });

    return NextResponse.json((data as any)?.insert_tasks_one);
  } catch (err) {
    console.error("POST /tasks/manager error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const mutation = gql`
      mutation UpdateTask(
        $id: Int!
        $title: String!
        $description: String!
        $deadline: date!
      ) {
        update_tasks_by_pk(
          pk_columns: { id: $id }
          _set: { title: $title, description: $description, deadline: $deadline }
        ) {
          id
          title
          description
          assigned_to
          assigned_by
          deadline
          status
        }
      }
    `;

    const { data } = await client.mutate({
      mutation,
      variables: body,
    });

    return NextResponse.json((data as any)?.update_tasks_by_pk);
  } catch (err) {
    console.error("PUT /tasks/manager error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const mutation = gql`
      mutation DeleteTask($id: Int!) {
        delete_tasks_by_pk(id: $id) {
          id
        }
      }
    `;

    const { data } = await client.mutate({
      mutation,
      variables: { id },
    });

    return NextResponse.json((data as any)?.delete_tasks_by_pk);
  } catch (err) {
    console.error("DELETE /tasks/manager error:", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}