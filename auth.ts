import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";

// This is a mock database for demonstration
// In a real app, you would use a real database
const mockUsers = [
  {
    id: "1",
    email: "user@example.com",
    // In a real app, this would be hashed
    password: "solar123",
  },
];

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnData = nextUrl.pathname.startsWith("/data");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnData) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      } else if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Solar Panel Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // In a real app, you would query your database
        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === (credentials.email as string).toLowerCase()
        );

        if (!user) return null;

        // In a real app, you would compare hashed passwords
        if (user.password !== credentials.password) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.email.split("@")[0], // Just for display purposes
        };
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);