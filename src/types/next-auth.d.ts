import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Account } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: unknown;
            error?: string|unknown;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            accessToken?: string;
            refreshToken?: string;
            expiresAt?: number;
        };
    }

    interface User {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        error?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
    }
}
interface ExtendedToken extends JWT {
    id: string; // ✅ Ensure ID exists in JWT
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    error?: string;
}

interface ExtendedAccount extends Account {
    expires_in: number;
}