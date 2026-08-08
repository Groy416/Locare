import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@locare.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const cleanEmail = credentials.email.toLowerCase().trim();
        const cleanPassword = credentials.password.trim();

        let user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        // Auto-seed demo accounts on-the-fly if missing from database
        if (!user && (cleanEmail === "customer@locare.com" || cleanEmail === "vendor@locare.com" || cleanEmail === "admin@locare.com")) {
          const role = cleanEmail.startsWith("customer") ? "customer" : cleanEmail.startsWith("vendor") ? "vendor" : "admin";
          const defaultPassword = cleanEmail.startsWith("customer") ? "customer123" : cleanEmail.startsWith("vendor") ? "vendor123" : "admin123";
          const passwordHash = await bcrypt.hash(defaultPassword, 10);

          user = await prisma.user.create({
            data: {
              name: role.toUpperCase(),
              email: cleanEmail,
              passwordHash,
              role,
            },
          });
        }

        if (!user) return null;

        let isValid = false;
        if (user.passwordHash) {
          isValid =
            (await bcrypt.compare(cleanPassword, user.passwordHash)) ||
            (await bcrypt.compare(credentials.password, user.passwordHash));
        }

        // Demo accounts fallback matching
        if (!isValid && cleanEmail === "customer@locare.com" && (cleanPassword === "customer123" || cleanPassword === "customer")) isValid = true;
        if (!isValid && cleanEmail === "vendor@locare.com" && (cleanPassword === "vendor123" || cleanPassword === "vendor")) isValid = true;
        if (!isValid && cleanEmail === "admin@locare.com" && (cleanPassword === "admin123" || cleanPassword === "admin")) isValid = true;

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "locare-secret-key-12345",
};
