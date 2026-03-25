import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";


type Task = {
  id: number
  title: string
  description: string
  assigned_to: number
  deadline: string
  status: string
}

type GetTasksResponse = {
  tasks: Task[]
}
export async function GET() {
  const query = gql`
    query {
      tasks {
        id
        title
        description
        assigned_to
        deadline
        status
      }
    }
  `

  const response = await client.query<GetTasksResponse>({
    query,
    fetchPolicy: "no-cache",
  })

  return NextResponse.json(response.data?.tasks)
}

export async function POST(req: Request) {
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
      }
    }
  `;

  const { data } = await client.mutate({
    mutation,
    variables: body,
  });

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
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
      }
    }
  `;

  const { data } = await client.mutate({
    mutation,
    variables: body,
  });

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
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

  return NextResponse.json(data);
}