export type StationId = 'radiotedu-en' | 'radiotedu-fr';
export type PublicLanguage = 'en' | 'fr';
export type SoundTag = 'warm' | 'bright' | 'calm' | 'focused' | 'energetic';

export interface StationPublicProgram {
  id: string;
  name: string;
  vibe: string | null;
  sound_tags: SoundTag[];
}

export interface StationPublicSnapshot {
  protocol: 'radiotedu-platform/v1';
  schema_version: 2;
  station: {
    id: StationId;
    language: PublicLanguage;
    display_name: string;
  };
  sequence: number;
  generated_at: string;
  expires_at: string | null;
  operational_state: 'live' | 'degraded' | 'offline' | 'starting' | 'unknown';
  speech_state: {
    active: boolean;
    kind: 'music' | 'talking' | 'idle' | 'unknown';
  };
  now_playing: {
    kind: 'music' | 'talking' | 'imaging' | 'unknown';
    track_id: string | null;
    title: string | null;
    artist: string | null;
    cover_id: string | null;
    mood: string | null;
    sound_tags: SoundTag[];
    started_at: string | null;
  } | null;
  current_program: StationPublicProgram | null;
  next_program: StationPublicProgram | null;
  stream: {
    url: string;
    mount: '/ai' | '/event';
    status: 'live' | 'degraded' | 'offline' | 'unknown';
    codec: 'MP3';
    bitrate_kbps: 192;
    public: true;
  };
  editorial: { sound_tags: SoundTag[] };
}

export interface StationPublicStatusResponse {
  protocol: 'radiotedu-platform/v1';
  station_id: StationId;
  online: boolean;
  stale: boolean;
  received_at: string | null;
  snapshot: StationPublicSnapshot | null;
  metrics: {
    airtime: {
      window_days: 14;
      classified_duration_ms: number;
      music_percent: number | null;
      talking_percent: number | null;
    };
    recent_plays: Array<{
      title: string;
      artist: string | null;
      program_name: string | null;
      occurred_at: string;
      duration_ms: number;
      genre: string | null;
      cover_url: string | null;
    }>;
    top_songs_14d: Array<{
      title: string;
      artist: string | null;
      play_count: number;
    }>;
    top_genres_14d: Array<{
      genre: string;
      airtime_percent: number;
    }>;
  };
}

export async function fetchStationPublicStatus(stationId: StationId): Promise<StationPublicStatusResponse> {
  const response = await fetch(`/v1/radio/stations/${stationId}/status`);
  if (!response.ok) {
    throw new Error(`Station status request failed: ${response.status}`);
  }
  return response.json() as Promise<StationPublicStatusResponse>;
}
