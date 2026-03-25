import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import client from "@/lib/apolloClient";
import { gql } from "@apollo/client";

const GET_USER = gql`
  query GetUser($id: Int!) {
    users_by_pk(id: $id) {
      id
      password
    }
  }
`;

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($id: Int!, $password: String!) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: { password: $password }
    ) {
      id
    }
  }
`;

export async function PUT(req: Request) {
  try {
    const { user_id, current_password, new_password } = await req.json();

    // 1️⃣ Get user
    const { data } = await client.query({
      query: GET_USER,
      variables: { id: user_id },
    });

    const user = data?.users_by_pk;

    if (!user) {
      return NextResponse.json({ error: "User not found" });
    }

    // 2️⃣ Check password
    const match = await bcrypt.compare(current_password, user.password);

    if (!match) {
      return NextResponse.json({ error: "Incorrect current password" });
    }

    // 3️⃣ Hash new password
    const hashed = await bcrypt.hash(new_password, 10);

    // 4️⃣ Update password
    await client.mutate({
      mutation: UPDATE_PASSWORD,
      variables: {
        id: user_id,
        password: hashed,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" });
  }
}