import type { MediaAsset } from "../media/model/media.types";
import type {Track} from "../timeline/model/timeline.type.ts";
import type {SubtitleCue, TranscriptSegment} from "../subtitle/model/subtitle.types.ts";


export interface Project {
  id: string
  name: string
  durationMs:number
  media: MediaAsset[]
  tracks: Track[]
  transcript: TranscriptSegment[]
  subtitles: SubtitleCue[]
  updatedAt: string
  version: number
}