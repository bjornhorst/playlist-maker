import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
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
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
    }
}
