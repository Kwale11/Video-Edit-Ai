import { createContext, type Dispatch } from 'react'
import type { EditorAction, EditorState } from './editor.types'

interface EditorContextValue {
    state: EditorState
    dispatch: Dispatch<EditorAction>
}

export const EditorContext = createContext<EditorContextValue | null>(null)
