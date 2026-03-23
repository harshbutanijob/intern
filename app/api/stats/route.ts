import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";


interface StatsQueryResult {
  totalUsers: {
    aggregate: {
      count: number;
    };
  };

  totalInterns: {
    aggregate: {
      count: number;
    };
  };

  interns: {
    department_id: number | null;
  }[];

  departments: {
    id: number;
    name: string;
  }[];
}
export async function GET() {
  try {

    const GET_STATS = gql`
      query GetStats {
        totalUsers: users_aggregate {
          aggregate {
            count
          }
        }

        totalInterns: users_aggregate(where: { role: { _eq: "intern" } }) {
          aggregate {
            count
          }
        }

        interns: users(where: { role: { _eq: "intern" } }) {
          department_id
        }

        departments {
          id
          name
        }
      }
    `;

   const res = await client.query<StatsQueryResult>({
  query: GET_STATS,
  fetchPolicy: "network-only",
});

    const totalUsers = res.data?.totalUsers?.aggregate.count;
    const totalInterns = res.data?.totalInterns.aggregate.count;

    const depMap: Record<string, number> = {};

    res.data?.interns.forEach((i) => {

      const dept = res.data?.departments.find(
        (d) => d.id === i.department_id
      );

      const name = dept ? dept.name : "Unassigned";

      depMap[name] = (depMap[name] || 0) + 1;

    });

    const departmentCounts = Object.entries(depMap).map(
      ([department, count]) => ({
        department,
        count,
      })
    );

    return NextResponse.json({
      totalUsers,
      totalInterns,
      departmentCounts,
    });

  } catch (error) {

    console.error("Stats API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}