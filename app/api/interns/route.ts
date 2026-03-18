import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {

  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [rows]: any = await pool.query("SELECT * FROM interns ORDER BY id DESC");

  return Response.json(rows);
}

export async function POST(req: Request) {

  const body = await req.json();

  const { name, college, department, phone_number, email, start_date } = body;

  await pool.query(
    "INSERT INTO interns (name,college,department,phone_number,email,start_date) VALUES (?,?,?,?,?,?)",
    [name, college, department, phone_number, email, start_date]
  );

  return Response.json({ message: "Intern added" });
}

export async function PUT(req: Request) {

  const body = await req.json();

  const { id, name, college, department, phone_number, email, start_date } = body;

  await pool.query(
    "UPDATE interns SET name=?, college=?, department=?, phone_number=?, email=?, start_date=? WHERE id=?",
    [name, college, department, phone_number, email, start_date, id]
  );

  return Response.json({ message: "Intern updated" });
}

export async function DELETE(req: Request) {

  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");

  await pool.query("DELETE FROM interns WHERE id=?", [id]);

  return Response.json({ message: "Intern deleted" });
}