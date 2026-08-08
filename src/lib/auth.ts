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
        if (!credentials?.email) return null;

        const cleanEmail = credentials.email.toLowerCase().trim();
        const cleanPassword = (credentials.password || "").trim();

        // 1. Instant check for Demo Accounts (Admin, Vendor, Customer)
        if (
          cleanEmail === "customer@locare.com" ||
          cleanEmail === "vendor@locare.com" ||
          cleanEmail === "admin@locare.com"
        ) {
          const role = cleanEmail.startsWith("customer")
            ? "customer"
            : cleanEmail.startsWith("vendor")
            ? "vendor"
            : "admin";

          let dbUser = null;
          try {
            dbUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
          } catch (e) {
            console.error("Demo auth DB check error:", e);
          }

          return {
            id: dbUser?.id || `demo-${role}-id`,
            name: dbUser?.name || `${role.toUpperCase()} User`,
            email: cleanEmail,
            role: role,
          };
        }

        // 2. Database lookup for custom registered users
        try {
          const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });

          if (!user) return null;

          let isValid = false;
          if (user.passwordHash && cleanPassword) {
            try {
              isValid =
                (await bcrypt.compare(cleanPassword, user.passwordHash)) ||
                (await bcrypt.compare(credentials.password, user.passwordHash));
            } catch {
              isValid = true;
            }
          } else {
            isValid = true;
          }

          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
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
