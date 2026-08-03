import type { EditorState } from './editor.types'
import type {Project} from "../../../entities/project/project.types.ts";

export function createInitialEditorState(project: Project): EditorState {
  return {
    project,
    currentTimeMs: 0,
    selectedClipIds: [project.tracks[0]?.clips[0]?.id].filter(Boolean) as string[],
    selectedSubtitleId: project.subtitles[0]?.id ?? null,
    zoom: 1,
    isPlaying: false,
    isDirty: false,
    history: [],
    future: [],
  }
}
