import { useEffect, useRef } from 'react'
import { useEditor } from '../hooks/useEditor'
import { formatTime } from '../utils/formatTime'

interface VideoPlayerProps {
    sourceUrl: string
    fileName: string
    onRequestUpload: () => void
}

export function VideoPlayer({ sourceUrl, fileName, onRequestUpload }: VideoPlayerProps) {
    const { state, dispatch } = useEditor()
    const videoRef = useRef<HTMLVideoElement>(null)
    const lastUpdateRef = useRef(0)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (state.isPlaying) {
            void video.play().catch(() => dispatch({ type: 'SET_PLAYING', isPlaying: false }))
        } else {
            video.pause()
        }
    }, [dispatch, state.isPlaying])

    useEffect(() => {
        const video = videoRef.current
        if (!video || !sourceUrl) return
        const targetSeconds = state.currentTimeMs / 1000
        if (Math.abs(video.currentTime - targetSeconds) > 0.35) {
            video.currentTime = targetSeconds
        }
    }, [sourceUrl, state.currentTimeMs])

    const activeSubtitle = state.project.subtitles.find(
        (subtitle) => subtitle.startMs <= state.currentTimeMs && state.currentTimeMs < subtitle.endMs,
    )

    const activeClip = state.project.tracks
        .flatMap((track) => track.clips)
        .find(
            (clip) =>
                clip.sourceStartMs <= state.currentTimeMs && state.currentTimeMs < clip.sourceEndMs,
        )

    function handleTimeUpdate() {
        const video = videoRef.current
        if (!video) return

        const timeMs = Math.round(video.currentTime * 1000)
        const deletedClip = state.project.tracks
            .flatMap((track) => track.clips)
            .find(
                (clip) => clip.deleted && clip.sourceStartMs <= timeMs && timeMs < clip.sourceEndMs,
            )

        if (deletedClip) {
            video.currentTime = deletedClip.sourceEndMs / 1000
            dispatch({ type: 'SEEK', timeMs: deletedClip.sourceEndMs })
            return
        }

        const now = performance.now()
        if (now - lastUpdateRef.current > 80) {
            dispatch({ type: 'SEEK', timeMs })
            lastUpdateRef.current = now
        }
    }

    return (
        <section className="preview-panel" aria-label="영상 미리보기">
            <div className="preview-stage">
                {sourceUrl ? (
                    <video
                        ref={videoRef}
                        src={sourceUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => dispatch({ type: 'SET_PLAYING', isPlaying: false })}
                        onLoadedMetadata={(event) => {
                            dispatch({
                                type: 'SET_DURATION',
                                durationMs: Math.round(event.currentTarget.duration * 1000),
                            })
                        }}
                    />
                ) : (
                    <button className="empty-video" type="button" onClick={onRequestUpload}>
                        <span className="empty-video__badge">AI VIDEO</span>
                        <strong>편집할 영상을 불러오세요</strong>
                        <span>MP4, MOV, WebM 파일을 지원합니다</span>
                        <span className="empty-video__action">＋ 영상 업로드</span>
                    </button>
                )}

                {sourceUrl && activeSubtitle && !activeClip?.deleted && (
                    <div
                        className={`video-subtitle video-subtitle--${activeSubtitle.style.position}`}
                        style={{
                            color: activeSubtitle.style.fontColor,
                            backgroundColor: activeSubtitle.style.backgroundColor,
                            fontFamily: activeSubtitle.style.fontFamily,
                            fontSize: `${Math.max(16, activeSubtitle.style.fontSize * 0.55)}px`,
                            fontWeight: activeSubtitle.style.fontWeight,
                        }}
                    >
                        {activeSubtitle.text}
                    </div>
                )}
            </div>

            <div className="player-controls">
                <button
                    className="icon-button icon-button--primary"
                    type="button"
                    disabled={!sourceUrl}
                    onClick={() => dispatch({ type: 'SET_PLAYING', isPlaying: !state.isPlaying })}
                    aria-label={state.isPlaying ? '일시정지' : '재생'}
                >
                    {state.isPlaying ? 'Ⅱ' : '▶'}
                </button>
                <span className="player-time">
          {formatTime(state.currentTimeMs)} <i>/</i> {formatTime(state.project.durationMs)}
        </span>
                <div className="player-progress">
                    <div
                        className="player-progress__filled"
                        style={{ width: `${(state.currentTimeMs / Math.max(state.project.durationMs, 1)) * 100}%` }}
                    />
                </div>
                <button className="ghost-button" type="button" onClick={onRequestUpload}>
                    {fileName || '영상 교체'}
                </button>
                <button className="icon-button" type="button" aria-label="전체 화면">
                    ⛶
                </button>
            </div>
        </section>
    )
}
