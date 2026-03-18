import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string; // Add role to session user
      department?: string | null; // Optional, only for managers
    };
  }

  interface User {
    id: string;
    role: string;
    department?: string | null;
  }

  interface AdapterUser {
    role: string;
    department?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: string; // Add role to JWT
    department?: string | null; // Optional, only for managers
  }
}

