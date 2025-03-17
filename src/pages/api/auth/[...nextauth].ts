import NextAuth, { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import type { JWT } from "next-auth/jwt";
import type { Session, Account } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization:
                "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-modify-public,playlist-modify-private",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account }: { token: JWT; account?: Account | null }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            return token;
        },
        async session({
                          session,
                          token,
                      }: {
            session: Session;
            token: JWT;
        }) {
            session.user.accessToken = token.accessToken as string;
            session.user.refreshToken = token.refreshToken as string;
            session.user.expiresAt = token.expiresAt as number;
            return session;
        },
    },
};

export default NextAuth(authOptions);
