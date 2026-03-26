import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const CHECK_ADMIN_EXISTS = gql`
  query CheckAdminExists($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
    }
  }
`;

export async function GET() {
    // Require an existing admin session to seed additional admins
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const name = "Admin User";
    const email = "admin@example.com";
    const plainPassword = "Admin@123";
    const role = "admin";

    try {
        // Check if admin already exists to prevent duplicates
        const { data: existingData } = await client.query({
            query: CHECK_ADMIN_EXISTS,
            variables: { email },
            fetchPolicy: "no-cache",
        });

        if (((existingData as any)?.users ?? []).length > 0) {
            return NextResponse.json({ message: "Admin already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const ADD_ADMIN = gql`
      mutation AddAdmin(
        $name: String!,
        $email: String!,
        $password: String!,
        $role: String!
      ) {
        insert_users_one(object: {
          name: $name,
          email: $email,
          password: $password,
          role: $role
        }) {
          id
          name
          email
        }
      }
    `;

        const res = await client.mutate({
            mutation: ADD_ADMIN,
            variables: { name, email, password: hashedPassword, role },
        });

        return NextResponse.json({
            message: "Admin created",
            admin: (res.data as any)?.insert_users_one,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}