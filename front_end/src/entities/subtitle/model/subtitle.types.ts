export interface TranscriptWord{
  id: string
  text: string
  startMs: number
  endMs: number
  confidence?: number
}

export  interface TranscriptSegment{
  id: string
  assetId: string
  startMs: number
  endMs: number
  text: string
  words: TranscriptWord[]
}

export interface  SubtitleStyle{
  fontFamily:string
  fontSize: number
  fontColor: string
  backgroundColor: string
  position: 'top' | 'center' | 'bottom'
  fontWeight: 400 | 500 | 600 | 700
}


export interface SubtitleCue {
  id: string
  transcriptSegmentId?: string
  startMs: number
  endMs: number
  text: string
  language: string
  style: SubtitleStyle
}
