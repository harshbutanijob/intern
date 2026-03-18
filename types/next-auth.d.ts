import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string; // Add role to session user
      department?: string|null; // Optional, only for managers
      
    };
  }

  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: string; // Add role to JWT
    department?: string|null; // Optional, only for managers
  }


}

