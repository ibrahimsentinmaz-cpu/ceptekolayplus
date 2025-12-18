import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getSheetsClient } from '@/lib/google';

// We need to define types for session
import { DefaultSession, NextAuthOptions } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            role?: string;
        } & DefaultSession['user']
    }
    interface User {
        role?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;

            try {
                // Init sheets client
                const client = getSheetsClient();
                const sheetId = process.env.GOOGLE_SHEET_ID;

                // Check if user exists in Users sheet
                // Columns: Email, Name, Role
                const response = await client.spreadsheets.values.get({
                    spreadsheetId: sheetId,
                    range: 'Users!A2:C',
                });

                const rows = response.data.values || [];
                const userEmail = user.email.toLowerCase().trim();
                const validUser = rows.find(row =>
                    row[0]?.trim().toLowerCase() === userEmail
                );

                if (validUser) {
                    // Attach role to user object to bubble it up
                    // This mutation is temporary for the session
                    user.role = validUser[2];
                    return true;
                }

                console.log(`User ${user.email} not found in whitelist.`);
                return false; // Deny sign in
            } catch (error) {
                console.error('Auth verification failed:', error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        error: '/auth/error', // Custom error page if needed
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
