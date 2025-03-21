import NextAuth, {NextAuthOptions, Account} from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import axios from "axios";
import {JWT} from "next-auth/jwt";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REFRESH_TOKEN_URL = "https://accounts.spotify.com/api/token";

interface ExtendedToken extends JWT {
    id: string;
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    error?: string;
}

interface ExtendedAccount extends Account {
    expires_in: number;
}

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
    try {
        const response = await axios.post(
            SPOTIFY_REFRESH_TOKEN_URL,
            new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            }),
            {
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
            }
        );

        const refreshedTokens = response.data;

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token || token.refreshToken,
        };
    } catch (error) {
        console.error("❌ Error refreshing access token:", error);
        return {...token, error: "RefreshTokenError"};
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: SPOTIFY_CLIENT_ID,
            clientSecret: SPOTIFY_CLIENT_SECRET,
            authorization:
                "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private,playlist-modify-public,playlist-modify-private,playlist-read-private,user-top-read",
        }),
    ],
    callbacks: {
        async jwt({token, account, user}) {
            const extendedToken = token as ExtendedToken;

            // On initial sign in
            if (account && user) {
                const spotifyAccount = account as ExtendedAccount;
                return {
                    id: user.id,
                    sub: user.id, // 🛡 ensure this token is scoped to this user
                    accessToken: account.access_token,
                    accessTokenExpires: Date.now() + spotifyAccount.expires_in * 1000,
                    refreshToken: account.refresh_token!,
                };
            }

            // Reuse existing token if not expired
            if (Date.now() < extendedToken.accessTokenExpires) {
                return extendedToken;
            }

            // Refresh token if expired
            return await refreshAccessToken(extendedToken);
        },

        async session({session, token}) {
            session.user.id = token.sub; // 👈 use sub (which is forced above)
            session.user.accessToken = token.accessToken;
            session.user.error = token.error;
            return session;
        },
    },
};

export default NextAuth(authOptions);
