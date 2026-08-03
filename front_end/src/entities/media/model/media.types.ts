export  type MediaType = 'video' | 'audio' | 'image'

export  interface  MediaAsset{
  id : string
  type: MediaType
  name: string
  url: string
  thumbnailUrl?: string
  durationMs?: number
  width?:number
  height?: number
}