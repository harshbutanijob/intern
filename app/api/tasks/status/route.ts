import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

const ALLOWED_STATUSES = ["pending", "in_progress", "completed"] as const;

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

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

    return NextResponse.json((data as any)?.update_tasks_by_pk);
  } catch (err) {
    console.error("PUT /tasks/status error:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}