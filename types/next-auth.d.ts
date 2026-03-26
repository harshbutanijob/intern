import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      department_id?: number | null;
    };
  }

  interface User {
    id: string;
    role: string;
    department_id?: number | null;
  }

  interface AdapterUser {
    role: string;
    department_id?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    department_id?: number | null;
  }
}

