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

export interface Playlist {
    collaborative: boolean;
    owner: {
        id: string;
    };
    id?: string;
    name: string;
    images: {
        url: string;
        width?: number | null;
        height?: number | null;
    }[];
    tracks: {
        total: number;
    };
}
