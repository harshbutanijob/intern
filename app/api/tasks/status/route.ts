import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

export async function PUT(req: Request) {
  const { id, status } = await req.json();

  const mutation = gql`
    mutation UpdateStatus($id: Int!, $status: String!) {
      update_tasks_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
        id
        status
      }
    }
  `;

  const { data } = await client.mutate({
    mutation,
    variables: { id, status },
  });

  return NextResponse.json(data);
}