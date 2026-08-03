export type TrackType = 'video' | 'audio' | 'subtitle' | 'image'


export interface Clip {
  id: string
  assetId: string
  transcriptSegmentId?: string
  label: string
  sourceStartMs: number
  sourceEndMs: number
  timelineStartMs: number
  timelineEndMs: number
  muted: boolean
  deleted: boolean
}

export interface Track {
  id: string
  type: TrackType
  name: string
  clips: Clip[]
  locked: boolean
  hidden: boolean
}
