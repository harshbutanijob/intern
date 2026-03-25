import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

type Task = {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
};

type GetTasksResponse = {
  tasks: Task[];
};

export async function GET(
  req: Request,
  context: { params: Promise<{ internId: string }> }
) {
  try {

    const { internId } = await context.params;

    console.log("Intern ID from params:", internId);

    const id = Number(internId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid Intern ID" },
        { status: 400 }
      );
    }

    const query = gql`
      query GetTasks($internId: Int!) {
        tasks(where: { assigned_to: { _eq: $internId } }) {
          id
          title
          description
          deadline
          status
        }
      }
    `;

    const response = await client.query<GetTasksResponse>({
      query,
      variables: { internId: id },
      fetchPolicy: "no-cache",
    });

    return NextResponse.json(response.data?.tasks ?? []);

  } catch (error) {
    console.error("Tasks API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}