// src/services/api/health.ts
import { cmsClient } from './client';
import { cmsConfig, withSiteFilter } from './config';
import { mediaUrl, videoPlaybackUrl, type CmsMultimedia } from './multimedia';

export interface CmsHealthVideo {
  id?: string;
  title?: string;
  order?: number;
  video?: CmsMultimedia | null;
  thumbnail?: CmsMultimedia | null;
}

export interface CmsHealthConfig {
  id: string;
  siteId?: string;
  languageCode?: string;
  title?: string;
  description?: string;
  image?: CmsMultimedia | null;
  videosSectionTitle?: string;
  videosSectionDescription?: string;
  videos?: CmsHealthVideo[];
}

export interface HealthVideoView {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
}

export interface HealthPage {
  title: string;
  description: string;
  image: string;
  videosSectionTitle: string;
  videosSectionDescription: string;
  videos: HealthVideoView[];
}

interface HealthListResponse {
  data: CmsHealthConfig[];
}

function mapVideo(video: CmsHealthVideo, index: number): HealthVideoView | null {
  const url = videoPlaybackUrl(video.video);
  if (!url) return null;

  return {
    id: video.id || `video-${index}`,
    url,
    thumbnail: mediaUrl(video.thumbnail) || video.video?.thumbnailUrl || '',
    title: video.title || '',
  };
}

function mapHealthPage(config: CmsHealthConfig): HealthPage {
  const videos = (config.videos ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(mapVideo)
    .filter((video): video is HealthVideoView => video !== null);

  return {
    title: config.title || '',
    description: config.description || '',
    image: mediaUrl(config.image),
    videosSectionTitle: config.videosSectionTitle || '',
    videosSectionDescription: config.videosSectionDescription || '',
    videos,
  };
}

export async function getHealthConfig(locale: string = 'es'): Promise<CmsHealthConfig | null> {
  const response = await cmsClient.get<HealthListResponse>(
    'v1/health',
    withSiteFilter({
      page: 1,
      pageSize: 20,
      languageCode: locale,
    })
  );

  const items = response.data ?? [];
  const item = items[0] ?? null;

  if (!item) {
    console.log(`[CMS] Sin health para ${locale} (site=${cmsConfig.siteId}). Recibidos: ${items.length}`);
    return null;
  }

  console.log(
    `[CMS] Health "${item.title ?? item.id}" con ${item.videos?.length ?? 0} videos`
  );
  return item;
}

export async function getHealthPage(locale: string): Promise<HealthPage | null> {
  try {
    const config = await getHealthConfig(locale);
    if (!config) return null;

    return mapHealthPage(config);
  } catch (error) {
    console.error('[CMS] Error al obtener health:', error);
    return null;
  }
}
