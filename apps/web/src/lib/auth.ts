import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@pharmacy/database";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: {
            tenant: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenant?.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
      }

      // Handle session update (for impersonation)
      if (trigger === "update" && session) {
        if (session.isImpersonating !== undefined) {
          token.isImpersonating = session.isImpersonating;
          token.originalRole = session.originalRole || token.role;
          token.impersonatingTenantId = session.impersonatingTenantId;
          token.impersonatingTenantName = session.impersonatingTenantName;
          
          // Update tenantId when impersonating
          if (session.isImpersonating && session.impersonatingTenantId) {
            token.tenantId = session.impersonatingTenantId;
            token.tenantName = session.impersonatingTenantName;
          } else if (!session.isImpersonating) {
            // Reset to original when stopping impersonation
            token.tenantId = null;
            token.tenantName = undefined;
            token.isImpersonating = false;
            token.impersonatingTenantId = undefined;
            token.impersonatingTenantName = undefined;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenantName = token.tenantName as string | undefined;
        
        // Add impersonation data
        session.user.isImpersonating = token.isImpersonating || false;
        session.user.originalRole = token.originalRole;
        session.user.impersonatingTenantId = token.impersonatingTenantId;
        session.user.impersonatingTenantName = token.impersonatingTenantName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

