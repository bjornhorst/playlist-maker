import LoginButton from "@/components/LoginButton";
import { useSession } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col h-screen items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Spotify Playlist Generator</h1>
            <LoginButton />
            {session && (
                <p className="mt-4 text-lg">Logged in as {session.user?.name}</p>
            )}
        </div>
    );
}
