export interface Track {
    popularity: number;
    id: string;
    uri: string;
    duration_ms: number;
    name: string;
}

export interface ArtistTracks {
    artistId: string;
    tracks: Track[];
}

export interface Album {
    id: string;
}

export interface Playlist{
    id?: string,
    name?: string,
}
