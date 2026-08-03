import type { MouseEvent } from 'react'
import { useEditor } from '../hooks/useEditor'
import { formatTime } from '../utils/formatTime'

export function Timeline() {
    const { state, dispatch } = useEditor()
    const durationMs = Math.max(state.project.durationMs, 1000)
    const contentWidth = Math.max(960, (durationMs / 1000) * 46 * state.zoom)
    const tickCount = Math.max(5, Math.ceil(durationMs / 5000))

    function handleSeek(event: MouseEvent<HTMLDivElement>) {
        const bounds = event.currentTarget.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
        dispatch({ type: 'SEEK', timeMs: ratio * durationMs })
    }

    return (
        <section className="timeline-panel" aria-label="영상 타임라인">
            <header className="timeline-toolbar">
                <div className="timeline-title">
                    <strong>타임라인</strong>
                    <span>{state.project.tracks[0]?.clips.length ?? 0}개 클립</span>
                </div>
                <div className="zoom-control">
                    <span>−</span>
                    <input
                        aria-label="타임라인 확대"
                        type="range"
                        min="0.75"
                        max="2.5"
                        step="0.25"
                        value={state.zoom}
                        onChange={(event) =>
                            dispatch({ type: 'SET_ZOOM', zoom: Number(event.target.value) })
                        }
                    />
                    <span>＋</span>
                </div>
            </header>

            <div className="timeline-scroll">
                <div className="timeline-content" style={{ width: `${contentWidth}px` }} onClick={handleSeek}>
                    <div className="timeline-ruler">
                        {Array.from({ length: tickCount + 1 }, (_, index) => {
                            const timeMs = Math.min(index * 5000, durationMs)
                            return (
                                <span key={timeMs} style={{ left: `${(timeMs / durationMs) * 100}%` }}>
                  {formatTime(timeMs)}
                </span>
                            )
                        })}
                    </div>

                    <div className="track-row">
                        <div className="track-label">VIDEO 1</div>
                        {state.project.tracks[0]?.clips.map((clip, index) => {
                            const left = (clip.timelineStartMs / durationMs) * 100
                            const width = ((clip.timelineEndMs - clip.timelineStartMs) / durationMs) * 100
                            const isSelected = state.selectedClipIds.includes(clip.id)
                            return (
                                <button
                                    className={`timeline-clip${isSelected ? ' is-selected' : ''}${clip.deleted ? ' is-deleted' : ''}`}
                                    key={clip.id}
                                    type="button"
                                    style={{ left: `${left}%`, width: `${width}%` }}
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        dispatch({ type: 'SELECT_CLIP', clipId: clip.id })
                                        dispatch({ type: 'SEEK', timeMs: clip.timelineStartMs })
                                    }}
                                >
                                    <span className={`clip-thumb clip-thumb--${(index % 4) + 1}`} />
                                    <span>{clip.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="subtitle-track-row">
                        <div className="track-label">SUBTITLE</div>
                        {state.project.subtitles.map((subtitle) => (
                            <button
                                className={`subtitle-clip${state.selectedSubtitleId === subtitle.id ? ' is-selected' : ''}`}
                                key={subtitle.id}
                                type="button"
                                style={{
                                    left: `${(subtitle.startMs / durationMs) * 100}%`,
                                    width: `${((subtitle.endMs - subtitle.startMs) / durationMs) * 100}%`,
                                }}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    dispatch({ type: 'SELECT_SUBTITLE', subtitleId: subtitle.id })
                                    dispatch({ type: 'SEEK', timeMs: subtitle.startMs })
                                }}
                            >
                                {subtitle.text}
                            </button>
                        ))}
                    </div>

                    <div
                        className="playhead"
                        style={{
                            left: `${68 + (state.currentTimeMs / durationMs) * (contentWidth - 78)}px`,
                        }}
                    >
                        <span />
                    </div>
                </div>
            </div>
        </section>
    )
}
