import { useSession } from "next-auth/react";
import LoginButton from "@/components/LoginButton";
import ArtistSearch from "@/components/ArtistSearch";

export default function Home() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col h-screen items-center justify-center space-y-6">
            <h1 className="text-3xl font-bold">Spotify Playlist Generator</h1>
            <LoginButton />
            {session && <ArtistSearch />}
        </div>
    );
}
