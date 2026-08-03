import type { SubtitleStyle } from '../entities/subtitle/model/subtitle.types'
import type {Project} from "../entities/project/project.types.ts";

const defaultStyle: SubtitleStyle = {
    fontFamily: 'Noto Sans KR',
    fontSize: 44,
    fontColor: '#ffffff',
    backgroundColor: '#15171d',
    position: 'bottom',
    fontWeight: 700,
}

const segments = [
    { id: 'segment-1', startMs: 0, endMs: 3600, text: '아이디어만 입력하면 영상의 초안이 완성됩니다.' },
    { id: 'segment-2', startMs: 3600, endMs: 7400, text: 'AI가 음성을 분석해 정확한 자막을 만들고,' },
    { id: 'segment-3', startMs: 7400, endMs: 11200, text: '문장을 지우는 것만으로 불필요한 장면을 편집해요.' },
    { id: 'segment-4', startMs: 11200, endMs: 15100, text: '원하는 언어를 선택하면 번역 자막도 바로 생성됩니다.' },
    { id: 'segment-5', startMs: 15100, endMs: 19500, text: '복잡한 타임라인 대신 콘텐츠에 집중해 보세요.' },
    { id: 'segment-6', startMs: 19500, endMs: 24000, text: '당신의 첫 번째 AI 영상을 지금 시작하세요.' },
]

export const sampleProject: Project = {
    id: 'project-demo-01',
    name: 'AI 영상 편집 서비스 소개',
    durationMs: 24000,
    updatedAt: '2026-08-02T09:00:00+09:00',
    version: 1,
    media: [
        {
            id: 'asset-video-01',
            type: 'video',
            name: '샘플 영상을 업로드해 주세요',
            url: '',
            durationMs: 24000,
            width: 1920,
            height: 1080,
        },
    ],
    transcript: segments.map((segment) => ({
        ...segment,
        assetId: 'asset-video-01',
        words: [],
    })),
    subtitles: segments.map((segment) => ({
        id: `subtitle-${segment.id}`,
        transcriptSegmentId: segment.id,
        startMs: segment.startMs,
        endMs: segment.endMs,
        text: segment.text,
        language: 'ko',
        style: { ...defaultStyle },
    })),
    tracks: [
        {
            id: 'track-video-01',
            type: 'video',
            name: '비디오',
            locked: false,
            hidden: false,
            clips: segments.map((segment, index) => ({
                id: `clip-${index + 1}`,
                assetId: 'asset-video-01',
                transcriptSegmentId: segment.id,
                label: `장면 ${index + 1}`,
                sourceStartMs: segment.startMs,
                sourceEndMs: segment.endMs,
                timelineStartMs: segment.startMs,
                timelineEndMs: segment.endMs,
                muted: false,
                deleted: false,
            })),
        },
    ],
}
