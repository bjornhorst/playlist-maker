"use client";
import { useState } from "react";
import axios from "axios";
import { Artist } from "@/types";

interface Track {
    id: string;
    uri: string;
    duration_ms: number;
    name: string;
}

interface ArtistTracks {
    artistId: string;
    tracks: Track[];
}

export default function PlaylistGenerator({ selectedArtists }: { selectedArtists: Artist[] }) {
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
            const { data } = await axios.post("/api/artists/top-tracks", { artistIds });

            const tracks = distributeTracks(
                data.artistTracks,
                useDuration ? undefined : amount,
                useDuration ? duration * 60 * 1000 : undefined,
                randomSongs
            );

            await axios.post("/api/playlists/manage", {
                playlistId: existingPlaylistId || undefined,
                title: playlistName,
                trackUris: tracks.map((t) => t.uri),
                clearExisting,
            });

            alert("Playlist generated successfully!");
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
        const tracksPerArtist = artistTracks.map((artist) => {
            let tracks = artist.tracks;
            if (randomize) tracks = tracks.sort(() => Math.random() - 0.5);
            return tracks;
        });

        const selectedTracks: Track[] = [];
        let trackCounter = 0;

        while (true) {
            let added = false;
            for (let i = 0; i < tracksPerArtist.length; i++) {
                const artistTrackList = tracksPerArtist[i];

                if (artistTrackList.length <= trackCounter) continue;

                const track = artistTrackList[trackCounter];

                if (totalTracks && selectedTracks.length >= totalTracks) return selectedTracks;

                if (totalDurationMs) {
                    const currentDuration = selectedTracks.reduce((acc, t) => acc + t.duration_ms, 0);
                    if (currentDuration >= totalDurationMs) return selectedTracks;
                }

                selectedTracks.push(track);
                added = true;
            }
            if (!added) break;
            trackCounter++;
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
