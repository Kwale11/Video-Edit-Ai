export function formatTime(timeMs: number, includeMilliseconds = false) {
    const safeTimeMs = Math.max(0, timeMs)
    const totalSeconds = Math.floor(safeTimeMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const base = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    if (!includeMilliseconds) return base
    return `${base}.${String(Math.floor((safeTimeMs % 1000) / 10)).padStart(2, '0')}`
}
