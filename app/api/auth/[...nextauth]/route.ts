
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { gql } from "@apollo/client";
import client from "../../../../lib/apolloClient";
import bcrypt from "bcryptjs";


type User = { id: string; name: string; email: string; password: string; role: string; };
type GetUserResult = { users: User[] };

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const GET_USER = gql`
          query GetUser($email: String!) {
            users(where: { email: { _eq: $email } }) {
              id
              name
              email
              password
              role
            }
          }
        `;

        const { data } = await client.query<GetUserResult>({
          query: GET_USER,
          variables: { email: credentials.email },
          fetchPolicy: "no-cache",
        });

        const user = data?.users[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id  ??"";
        token.name = user.name??"";
        token.email = user.email??"";
        token.role = user.role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string; 
        
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// App Router handlers
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);