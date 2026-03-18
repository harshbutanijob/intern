import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into MySQL
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: err.message || "Something went wrong" }), { status: 500 });
  }
}