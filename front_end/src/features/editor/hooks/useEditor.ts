import { useContext } from 'react'
import { EditorContext } from '../model/editor.context-value'

export function useEditor() {
    const context = useContext(EditorContext)

    if (!context) {
        throw new Error('useEditor는 EditorProvider 내부에서 사용해야 합니다.')
    }

    return context
}
