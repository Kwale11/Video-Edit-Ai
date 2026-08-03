import { useEditor } from '../hooks/useEditor'
import { formatTime } from '../utils/formatTime'

export function TranscriptPanel() {
    const { state, dispatch } = useEditor()
    const clips = state.project.tracks.flatMap((track) => track.clips)

    return (
        <section className="transcript-panel" aria-label="자막 편집">
            <header className="panel-heading">
                <div>
                    <p className="eyebrow">SCRIPT EDITOR</p>
                    <h2>자막으로 영상 편집</h2>
                </div>
                <div className="transcript-actions">
                    <button type="button">맞춤법 검사</button>
                    <button type="button">AI 번역</button>
                </div>
            </header>

            <div className="transcript-help">
                문장을 선택하면 영상이 해당 위치로 이동합니다. 삭제한 문장 구간은 재생할 때 건너뜁니다.
            </div>

            <div className="transcript-list">
                {state.project.subtitles.map((subtitle, index) => {
                    const clip = clips.find(
                        (item) => item.transcriptSegmentId === subtitle.transcriptSegmentId,
                    )
                    const isSelected = state.selectedSubtitleId === subtitle.id

                    return (
                        <article
                            className={`transcript-item${isSelected ? ' is-selected' : ''}${clip?.deleted ? ' is-deleted' : ''}`}
                            key={subtitle.id}
                            onClick={() => {
                                dispatch({ type: 'SELECT_SUBTITLE', subtitleId: subtitle.id })
                                if (clip) dispatch({ type: 'SELECT_CLIP', clipId: clip.id })
                                dispatch({ type: 'SEEK', timeMs: subtitle.startMs })
                            }}
                        >
                            <div className="transcript-index">{String(index + 1).padStart(2, '0')}</div>
                            <div className="transcript-body">
                <span className="transcript-time">
                  {formatTime(subtitle.startMs, true)} — {formatTime(subtitle.endMs, true)}
                </span>
                                <textarea
                                    rows={2}
                                    value={subtitle.text}
                                    aria-label={`${index + 1}번 자막`}
                                    onClick={(event) => event.stopPropagation()}
                                    onFocus={() => dispatch({ type: 'SELECT_SUBTITLE', subtitleId: subtitle.id })}
                                    onChange={(event) =>
                                        dispatch({
                                            type: 'UPDATE_SUBTITLE',
                                            subtitleId: subtitle.id,
                                            text: event.target.value,
                                        })
                                    }
                                />
                            </div>
                            {clip && (
                                <button
                                    className="delete-segment"
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        dispatch({ type: 'TOGGLE_CLIP_DELETED', clipId: clip.id })
                                    }}
                                >
                                    {clip.deleted ? '복구' : '삭제'}
                                </button>
                            )}
                        </article>
                    )
                })}
            </div>
        </section>
    )
}
