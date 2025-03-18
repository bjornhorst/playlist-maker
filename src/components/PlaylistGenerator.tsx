"use client";
import {useState} from "react";
import axios from "axios";
import {Artist} from "@/types";

interface Track {
    popularity: number;
    id: string;
    uri: string;
    duration_ms: number;
    name: string;
}

interface ArtistTracks {
    artistId: string;
    tracks: Track[];
}

export default function PlaylistGenerator({selectedArtists}: { selectedArtists: Artist[] }) {
    const [amount, setAmount] = useState<number>(25);
    const [duration, setDuration] = useState<number>(0); // minutes
    const [useDuration, setUseDuration] = useState<boolean>(false);
    const [randomSongs, setRandomSongs] = useState<boolean>(false);
    const [playlistName, setPlaylistName] = useState<string>("");
    const [existingPlaylistId, setExistingPlaylistId] = useState<string>("");
    const [clearExisting, setClearExisting] = useState<boolean>(false);

    const generatePlaylist = async () => {
        if (selectedArtists.length === 0) {
            alert("Select at least one artist.");
            return;
        }

        try {
            const artistIds = selectedArtists.map((a) => a.id);

            // Fetch tracks from backend
            const { data } = await axios.post("/api/artists/top-tracks", { artistIds });

            // Determine parameters clearly
            const totalDurationMs = useDuration ? duration * 60 * 1000 : undefined;
            const totalTracks = useDuration ? undefined : amount;

            // Select tracks based on filters
            const tracks = distributeTracks(data.artistTracks, totalTracks, totalDurationMs, randomSongs);

            // Call API to manage playlist
            await axios.post("/api/playlists/manage", {
                playlistId: existingPlaylistId || undefined,
                title: playlistName,
                trackUris: tracks.map((t) => t.uri),
                clearExisting,
            });

            alert(`Playlist generated successfully with ${tracks.length} songs!`);
        } catch (error) {
            console.error("Error generating playlist:", error);
            alert("Failed to generate playlist.");
        }
    };

    const distributeTracks = (
        artistTracks: ArtistTracks[],
        totalTracks?: number,
        totalDurationMs?: number,
        randomize = false
    ): Track[] => {
        const selectedTracks: Track[] = [];
        const numArtists = artistTracks.length;

        if (randomize) {
            artistTracks.forEach(artist => artist.tracks.sort(() => Math.random() - 0.5));
        } else {
            artistTracks.forEach(artist => artist.tracks.sort((a, b) => b.popularity - a.popularity));
        }

        const trackIndices = Array(numArtists).fill(0);
        let currentDuration = 0;

        while (true) {
            let addedInCycle = false;

            for (let i = 0; i < numArtists; i++) {
                const artist = artistTracks[i];
                const index = trackIndices[i];

                if (index >= artist.tracks.length) continue;

                const track = artist.tracks[index];

                if (totalTracks && selectedTracks.length >= totalTracks) {
                    return selectedTracks;
                }

                selectedTracks.push(track);
                currentDuration += track.duration_ms;
                trackIndices[i] += 1;
                addedInCycle = true;

                if (totalDurationMs && currentDuration >= totalDurationMs) {
                    return selectedTracks; // Nu stop je pas NADAT je over de duur heen bent.
                }
            }

            if (!addedInCycle) break; // Geen nummers meer beschikbaar
        }

        return selectedTracks;
    };


    return (
        <div className="flex flex-col space-y-4 p-4 border rounded-md">
            <h2 className="text-xl font-semibold">Generate Playlist</h2>

            <div>
                <label className="block">Playlist Title</label>
                <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="border rounded px-2 py-1 w-full text-black"
                    placeholder="New playlist title"
                />
            </div>

            <div>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={useDuration}
                        onChange={(e) => setUseDuration(e.target.checked)}
                    />
                    <span>Use total duration (minutes)</span>
                </label>
                {useDuration ? (
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-full text-black"
                        placeholder="Duration in minutes"
                    />
                ) : (
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-full text-black"
                        placeholder="Number of songs"
                    />
                )}
            </div>

            <label className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={randomSongs}
                    onChange={(e) => setRandomSongs(e.target.checked)}
                />
                <span>Randomize songs (instead of most popular)</span>
            </label>

            <div>
                <label className="block">Existing Playlist ID (optional)</label>
                <input
                    type="text"
                    value={existingPlaylistId}
                    onChange={(e) => setExistingPlaylistId(e.target.value)}
                    className="border rounded px-2 py-1 w-full text-black"
                    placeholder="Paste Spotify playlist ID here"
                />
            </div>

            {existingPlaylistId && (
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={clearExisting}
                        onChange={(e) => setClearExisting(e.target.checked)}
                    />
                    <span>Clear existing playlist first</span>
                </label>
            )}

            <button
                onClick={generatePlaylist}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
                Generate Playlist
            </button>
        </div>
    );
}
