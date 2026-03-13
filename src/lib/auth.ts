import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { host } = new URL(url);
        await transporter.sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: `Sign in to DocuAI`,
          text: `Sign in to DocuAI\n\n${url}\n\n`,
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #18181b; font-size: 24px; margin-bottom: 24px;">Sign in to DocuAI</h1>
              <p style="color: #71717a; font-size: 16px; margin-bottom: 32px;">Click the button below to sign in to your account on ${host}</p>
              <a href="${url}" style="background-color: #18181b; color: #fafafa; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; display: inline-block;">Sign In</a>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 32px;">If you didn't request this email, you can safely ignore it.</p>
            </div>
          `,
        });
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
