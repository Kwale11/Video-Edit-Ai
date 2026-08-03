import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { InspectorPanel } from '../../features/editor/components/InspectorPanel'
import { Timeline } from '../../features/editor/components/Timeline'
import { TranscriptPanel } from '../../features/editor/components/TranscriptPanel'
import { VideoPlayer } from '../../features/editor/components/VideoPlayer'
import { useEditor } from '../../features/editor/hooks/useEditor'
import { EditorProvider } from '../../features/editor/model/editor.context'
import { sampleProject } from '../../mocks/sampleProject'
import './EditorPage.css'
import './EditorPanels.css'
import './EditorTimeline.css'

function EditorWorkspace() {
    const { state, dispatch } = useEditor()
    const [videoUrl, setVideoUrl] = useState('')
    const [fileName, setFileName] = useState('')
    const [isExportOpen, setIsExportOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const objectUrlRef = useRef('')

    useEffect(
        () => () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        },
        [],
    )

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        const nextUrl = URL.createObjectURL(file)
        objectUrlRef.current = nextUrl
        setVideoUrl(nextUrl)
        setFileName(file.name)
        dispatch({ type: 'SEEK', timeMs: 0 })
        dispatch({ type: 'SET_PLAYING', isPlaying: false })
        event.target.value = ''
    }

    function splitSelectedClip() {
        const clipId = state.selectedClipIds[0]
        if (!clipId) return
        dispatch({
            type: 'SPLIT_CLIP',
            clipId,
            timeMs: state.currentTimeMs,
            newClipId: crypto.randomUUID(),
        })
    }

    function toggleSelectedClip() {
        const clipId = state.selectedClipIds[0]
        if (clipId) dispatch({ type: 'TOGGLE_CLIP_DELETED', clipId })
    }

    return (
        <main className="editor-app">
            <input
                ref={inputRef}
                className="visually-hidden"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
            />

            <header className="app-header">
                <div className="brand-mark">Edit</div>
                <div className="project-meta">
                    <span>내 프로젝트</span>
                    <strong>{state.project.name}</strong>
                </div>
                <div className="save-state">
                    <span className={state.isDirty ? 'is-dirty' : ''} />
                    {state.isDirty ? '변경사항 저장 대기' : '모든 변경사항 저장됨'}
                </div>
                <div className="header-actions">
                    <button
                        className="icon-button"
                        type="button"
                        disabled={!state.history.length}
                        onClick={() => dispatch({ type: 'UNDO' })}
                        aria-label="실행 취소"
                    >
                        ↶
                    </button>
                    <button
                        className="icon-button"
                        type="button"
                        disabled={!state.future.length}
                        onClick={() => dispatch({ type: 'REDO' })}
                        aria-label="다시 실행"
                    >
                        ↷
                    </button>
                    <span className="header-divider" />
                    <button className="preview-button" type="button">미리보기</button>
                    <button className="export-button" type="button" onClick={() => setIsExportOpen(true)}>
                        내보내기 <span>↗</span>
                    </button>
                </div>
            </header>

            <nav className="tool-sidebar" aria-label="편집 도구">
                <button className="is-active" type="button"><b>▣</b><span>미디어</span></button>
                <button type="button"><b>T</b><span>텍스트</span></button>
                <button type="button"><b>CC</b><span>자막</span></button>
                <button type="button"><b>♫</b><span>오디오</span></button>
                <button type="button"><b>✦</b><span>AI 도구</span></button>
                <button type="button"><b>◫</b><span>템플릿</span></button>
            </nav>

            <section className="workspace">
                <div className="workspace-top">
                    <div className="left-workspace">
                        <VideoPlayer
                            sourceUrl={videoUrl}
                            fileName={fileName}
                            onRequestUpload={() => inputRef.current?.click()}
                        />
                        <TranscriptPanel />
                    </div>
                    <InspectorPanel />
                </div>

                <div className="edit-toolbar">
                    <button type="button" onClick={splitSelectedClip}>✂ 현재 위치에서 나누기</button>
                    <button type="button" onClick={toggleSelectedClip}>⌫ 선택 클립 삭제·복구</button>
                    <span />
                    <button type="button">무음 구간 찾기 <em>AI</em></button>
                </div>

                <Timeline />
            </section>

            {isExportOpen && (
                <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsExportOpen(false)}>
                    <section
                        className="export-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="export-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <button className="modal-close" type="button" onClick={() => setIsExportOpen(false)}>×</button>
                        <span className="modal-icon">↗</span>
                        <h2 id="export-title">영상 내보내기</h2>
                        <p>Spring Boot 렌더링 API가 연결되면 현재 편집 명령과 자막 스타일을 서버로 전송합니다.</p>
                        <div className="export-summary">
                            <div><span>포맷</span><strong>MP4</strong></div>
                            <div><span>해상도</span><strong>1080p</strong></div>
                            <div><span>자막</span><strong>영상에 포함</strong></div>
                        </div>
                        <button className="export-confirm" type="button" disabled>백엔드 연결 후 사용할 수 있어요</button>
                    </section>
                </div>
            )}
        </main>
    )
}

export function EditorPage() {
    return (
        <EditorProvider key={sampleProject.id} project={sampleProject}>
            <EditorWorkspace />
        </EditorProvider>
    )
}
