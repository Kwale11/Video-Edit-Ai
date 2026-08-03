import {
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react'
import { EditorContext } from './editor.context-value'
import { createInitialEditorState } from './editor.initial-state'
import { editorReducer } from './editor.reducer'
import type {Project} from "../../../entities/project/project.types.ts";

interface EditorProviderProps extends PropsWithChildren {
  project: Project
}

export function EditorProvider({ project, children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, project, createInitialEditorState)
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}
