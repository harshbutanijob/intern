import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

// Define a type for the user
type User = {
  id: number;
  name: string;
};

// Define the shape of the GraphQL response
type GetInternsResponse = {
  users: User[];
};

export async function GET(
  req: Request,
  { params }: { params: { deptId: string } }
) {
  const query = gql`
    query GetInterns($deptId:Int!) {
      users(where:{
        role:{_eq:"intern"},
        department_id:{_eq:$deptId}
      }){
        id
        name
      }
    }
  `;

  try {
    const { data } = await client.query<GetInternsResponse>({
      query,
      variables: { deptId: Number(params.deptId) },
      fetchPolicy: "no-cache",
    });

    // Now TypeScript knows data has property 'users'
    return NextResponse.json(data?.users);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching interns", details: error });
  }
}