import { useEditor } from '../hooks/useEditor'

export function InspectorPanel() {
    const { state, dispatch } = useEditor()
    const subtitle = state.project.subtitles.find(
        (item) => item.id === state.selectedSubtitleId,
    )

    if (!subtitle) {
        return (
            <aside className="inspector-panel">
                <div className="inspector-empty">자막을 선택하면 속성을 편집할 수 있습니다.</div>
            </aside>
        )
    }

    return (
        <aside className="inspector-panel" aria-label="자막 속성">
            <header className="panel-heading panel-heading--compact">
                <div>
                    <p className="eyebrow">INSPECTOR</p>
                    <h2>자막 스타일</h2>
                </div>
            </header>

            <div className="property-group">
                <label htmlFor="font-family">글꼴</label>
                <select
                    id="font-family"
                    value={subtitle.style.fontFamily}
                    onChange={(event) =>
                        dispatch({
                            type: 'UPDATE_SUBTITLE_STYLE',
                            subtitleId: subtitle.id,
                            style: { fontFamily: event.target.value },
                        })
                    }
                >
                    <option>Noto Sans KR</option>
                    <option>DM Sans</option>
                    <option>Arial</option>
                </select>
            </div>

            <div className="property-group">
                <div className="property-label-row">
                    <label htmlFor="font-size">크기</label>
                    <span>{subtitle.style.fontSize}px</span>
                </div>
                <input
                    id="font-size"
                    type="range"
                    min="24"
                    max="72"
                    value={subtitle.style.fontSize}
                    onChange={(event) =>
                        dispatch({
                            type: 'UPDATE_SUBTITLE_STYLE',
                            subtitleId: subtitle.id,
                            style: { fontSize: Number(event.target.value) },
                        })
                    }
                />
            </div>

            <div className="property-grid">
                <div className="property-group">
                    <label htmlFor="font-color">글자</label>
                    <input
                        id="font-color"
                        type="color"
                        value={subtitle.style.fontColor}
                        onChange={(event) =>
                            dispatch({
                                type: 'UPDATE_SUBTITLE_STYLE',
                                subtitleId: subtitle.id,
                                style: { fontColor: event.target.value },
                            })
                        }
                    />
                </div>
                <div className="property-group">
                    <label htmlFor="background-color">배경</label>
                    <input
                        id="background-color"
                        type="color"
                        value={subtitle.style.backgroundColor}
                        onChange={(event) =>
                            dispatch({
                                type: 'UPDATE_SUBTITLE_STYLE',
                                subtitleId: subtitle.id,
                                style: { backgroundColor: event.target.value },
                            })
                        }
                    />
                </div>
            </div>

            <div className="property-group">
                <span className="property-title">화면 위치</span>
                <div className="segmented-control">
                    {(['top', 'center', 'bottom'] as const).map((position) => (
                        <button
                            className={subtitle.style.position === position ? 'is-active' : ''}
                            key={position}
                            type="button"
                            onClick={() =>
                                dispatch({
                                    type: 'UPDATE_SUBTITLE_STYLE',
                                    subtitleId: subtitle.id,
                                    style: { position },
                                })
                            }
                        >
                            {{ top: '상단', center: '중앙', bottom: '하단' }[position]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="ai-card">
                <span>AI TRANSLATION</span>
                <strong>다른 언어의 자막이 필요하신가요?</strong>
                <p>문맥을 유지하면서 현재 자막을 자연스럽게 번역합니다.</p>
                <button type="button">번역 언어 선택</button>
            </div>
        </aside>
    )
}
