import type { Project } from '../../../entities/project/model/project.types'
import type { EditorAction, EditorState } from './editor.types'

function commitProject(state: EditorState, project: Project): EditorState {
  return {
    ...state,
    project,
    history: [...state.history.slice(-49), state.project],
    future: [],
    isDirty: true,
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SEEK':
      return {
        ...state,
        currentTimeMs: Math.max(0, Math.min(action.timeMs, state.project.durationMs)),
      }

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.isPlaying }

    case 'SET_DURATION':
      return {
        ...state,
        project: { ...state.project, durationMs: action.durationMs },
        currentTimeMs: Math.min(state.currentTimeMs, action.durationMs),
      }

    case 'SELECT_CLIP':
      return { ...state, selectedClipIds: [action.clipId] }

    case 'SELECT_SUBTITLE':
      return { ...state, selectedSubtitleId: action.subtitleId }

    case 'UPDATE_SUBTITLE':
      return commitProject(state, {
        ...state.project,
        subtitles: state.project.subtitles.map((subtitle) =>
            subtitle.id === action.subtitleId ? { ...subtitle, text: action.text } : subtitle,
        ),
      })

    case 'UPDATE_SUBTITLE_STYLE':
      return commitProject(state, {
        ...state.project,
        subtitles: state.project.subtitles.map((subtitle) =>
            subtitle.id === action.subtitleId
                ? { ...subtitle, style: { ...subtitle.style, ...action.style } }
                : subtitle,
        ),
      })

    case 'TOGGLE_CLIP_DELETED':
      return commitProject(state, {
        ...state.project,
        tracks: state.project.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) =>
              clip.id === action.clipId ? { ...clip, deleted: !clip.deleted } : clip,
          ),
        })),
      })

    case 'SPLIT_CLIP': {
      const project = {
        ...state.project,
        tracks: state.project.tracks.map((track) => ({
          ...track,
          clips: track.clips.flatMap((clip) => {
            if (
                clip.id !== action.clipId ||
                action.timeMs <= clip.timelineStartMs ||
                action.timeMs >= clip.timelineEndMs
            ) {
              return [clip]
            }

            const splitOffset = action.timeMs - clip.timelineStartMs
            return [
              {
                ...clip,
                sourceEndMs: clip.sourceStartMs + splitOffset,
                timelineEndMs: action.timeMs,
              },
              {
                ...clip,
                id: action.newClipId,
                label: `${clip.label} ②`,
                sourceStartMs: clip.sourceStartMs + splitOffset,
                timelineStartMs: action.timeMs,
              },
            ]
          }),
        })),
      }
      return commitProject(state, project)
    }

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.75, Math.min(action.zoom, 2.5)) }

    case 'UNDO': {
      const previous = state.history.at(-1)
      if (!previous) return state
      return {
        ...state,
        project: previous,
        history: state.history.slice(0, -1),
        future: [state.project, ...state.future],
        isDirty: true,
      }
    }

    case 'REDO': {
      const next = state.future[0]
      if (!next) return state
      return {
        ...state,
        project: next,
        history: [...state.history, state.project],
        future: state.future.slice(1),
        isDirty: true,
      }
    }
  }
}
