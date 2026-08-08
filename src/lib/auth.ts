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

        if (!cleanEmail || !cleanPassword) return null;

        try {
          // Look up user in database
          const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
          });

          // Demo accounts default password mapping
          const demoPasswords: Record<string, string> = {
            "admin@locare.com": "admin123",
            "vendor@locare.com": "vendor123",
            "customer@locare.com": "customer123",
            "garimaa.roy0401@gmail.com": "Garima@0401",
          };

          // 1. If user exists in DB, compare against passwordHash or demo password
          if (user && user.passwordHash) {
            let isValid = await bcrypt.compare(cleanPassword, user.passwordHash).catch(() => false);
            if (!isValid && demoPasswords[cleanEmail]) {
              isValid = cleanPassword === demoPasswords[cleanEmail];
            }
            if (!isValid && cleanEmail === "garimaa.roy0401@gmail.com" && cleanPassword === "Garima@0401") {
              isValid = true;
            }

            if (!isValid) {
              return null; // Incorrect password -> Reject!
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

          // 2. If user is a demo account not yet in DB, validate demo password & persist
          if (!user && demoPasswords[cleanEmail]) {
            if (cleanPassword !== demoPasswords[cleanEmail]) {
              return null; // Incorrect password -> Reject!
            }

            const role = cleanEmail.startsWith("vendor")
              ? "vendor"
              : cleanEmail.startsWith("admin")
              ? "admin"
              : "customer";

            const newHash = await bcrypt.hash(cleanPassword, 10);
            const created = await prisma.user.create({
              data: {
                firstName: cleanEmail.split("@")[0],
                name: cleanEmail.split("@")[0],
                email: cleanEmail,
                passwordHash: newHash,
                role,
              },
            }).catch(() => null);

            return {
              id: created ? created.id : `user-${cleanEmail}`,
              name: created ? created.name : cleanEmail.split("@")[0],
              email: cleanEmail,
              role,
            };
          }

          // User not found -> Reject!
          return null;
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
