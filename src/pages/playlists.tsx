"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Playlist } from "@/types/playlist";
import { fetchPlaylists } from "@/lib/functions";
import Image from "next/image";

export default function UserPlaylists() {
    const { data: session, status } = useSession();
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserPlaylists = async () => {
            if (session?.user?.id) {
                setLoading(true);
                const playlists = await fetchPlaylists(session.user.id);
                setUserPlaylists(playlists);
                setLoading(false);
            }
        };

        fetchUserPlaylists();
    }, [session]);

    if (status === "loading" || loading) {
        return <div className="p-4">Loading playlists...</div>;
    }

    if (!session) {
        return <div className="p-4">Please log in to see your playlists.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {userPlaylists.map((playlist: Playlist) => (
                <div key={playlist.id} className="bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden">
                    {playlist.images && playlist.images.length > 0 ? (
                        <Image
                            src={`/api/images/image-proxy?url=${encodeURIComponent(playlist.images[0].url)}`}
                            alt={playlist.name}
                            width={300}
                            height={300}
                            className="w-full h-48 object-cover"
                        />

                        ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}

                    <div className="p-4">
                        <h3 className="text-lg font-semibold truncate">{playlist.name}</h3>
                        <p className="text-sm text-gray-300">{playlist.tracks.total} songs</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
