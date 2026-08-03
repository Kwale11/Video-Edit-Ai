import type { SubtitleStyle } from '../../../entities/subtitle/model/subtitle.types'
import type {Project} from "../../../entities/project/project.types.ts";

export interface EditorState {
    project: Project
    currentTimeMs: number
    selectedClipIds: string[]
    selectedSubtitleId: string | null
    zoom: number
    isPlaying: boolean
    isDirty: boolean
    history: Project[]
    future: Project[]
}

export type EditorAction =
    | { type: 'SEEK'; timeMs: number }
    | { type: 'SET_PLAYING'; isPlaying: boolean }
    | { type: 'SET_DURATION'; durationMs: number }
    | { type: 'SELECT_CLIP'; clipId: string }
    | { type: 'SELECT_SUBTITLE'; subtitleId: string }
    | { type: 'UPDATE_SUBTITLE'; subtitleId: string; text: string }
    | { type: 'UPDATE_SUBTITLE_STYLE'; subtitleId: string; style: Partial<SubtitleStyle> }
    | { type: 'TOGGLE_CLIP_DELETED'; clipId: string }
    | { type: 'SPLIT_CLIP'; clipId: string; timeMs: number; newClipId: string }
    | { type: 'SET_ZOOM'; zoom: number }
    | { type: 'UNDO' }
    | { type: 'REDO' }
