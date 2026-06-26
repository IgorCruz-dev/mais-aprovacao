export type LiveStatus = "scheduled" | "live" | "ended";

export interface LiveClass {
  id: string;
  course_id: string | null;
  module_id: string | null;
  title: string;
  scheduled_at: string;
  duration_mins: number;
  ivs_stream_key: string | null;
  ivs_playback_url: string | null;
  recording_url: string | null;
  status: LiveStatus;
  created_at: string;
  updated_at: string;
}
