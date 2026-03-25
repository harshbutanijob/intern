import { NextResponse } from "next/server";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";
import bcrypt from "bcrypt";

export async function GET() {
    const name = "Admin User";
    const email = "admin@example.com";
    const plainPassword = "Admin@123"; // change this
    const role = "admin";
    const department_id = "";

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const ADD_ADMIN = gql`
      mutation AddAdmin(
        $name: String!,
        $email: String!,
        $password: String!,
        $role: String!,
        $department_id: Int
      ) {
        insert_users_one(object: {
          name: $name,
          email: $email,
          password: $password,
          role: $role,
          department_id: $department_id
        }) {
          id
          name
          email
        }
      }
    `;

        const res = await client.mutate({
            mutation: ADD_ADMIN,
            variables: {
                name,
                email,
                password: hashedPassword,
                role,
                department_id,
            },
        });

        return NextResponse.json({
            message: "Admin created",
            admin: (res.data as any)?.insert_users_one,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}