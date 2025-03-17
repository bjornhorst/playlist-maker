"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
    const { data: session } = useSession();

    return session ? (
        <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            Sign out
        </button>
    ) : (
        <button
            onClick={() => signIn("spotify")}
            className="bg-green-500 text-white px-4 py-2 rounded"
        >
            Sign in with Spotify
        </button>
    );
}
