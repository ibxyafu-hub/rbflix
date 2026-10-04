/**
 * Utility functions for analyzing and normalizing video embed URLs for the RBflix Video Player.
 */

/**
 * Checks if a URL points directly to a raw video media file (mp4, webm, etc.)
 */
export function isDirectVideoUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return /\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/i.test(clean);
}

/**
 * Checks if a URL is an embed URL (e.g. iframe page, video player page, etc.)
 */
export function isEmbedUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  if (
    clean.includes('/embed') ||
    clean.includes('vidsrc') ||
    clean.includes('vsembed') ||
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('vimeo.com') ||
    clean.includes('dailymotion.com') ||
    clean.includes('streamable.com') ||
    clean.includes('drive.google.com') ||
    clean.includes('player.') ||
    clean.endsWith('.html') ||
    clean.endsWith('.htm')
  ) {
    return true;
  }
  return !isDirectVideoUrl(url);
}

/**
 * Transforms watch URLs and provider links into clean, embeddable iframe URLs.
 * Removes parameters that trigger strict sandboxed cross-frame blocking (such as enablejsapi or mismatched origin).
 */
export function normalizeEmbedUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  try {
    // 1. YouTube watch URLs, short URLs, and embed URLs
    // Formats:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://www.youtube.com/shorts/VIDEO_ID
    const youtubeMatch = trimmed.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    );
    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];
      // Use standard youtube.com/embed endpoint with playsinline and autoplay
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`;
    }

    // 2. Vimeo standard & player URLs
    // Formats: https://vimeo.com/123456789 -> https://player.vimeo.com/video/123456789
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      const vimeoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
    }

    // 3. Dailymotion URLs
    // Formats: https://www.dailymotion.com/video/x8xyz -> https://www.dailymotion.com/embed/video/x8xyz
    const dailyMotionMatch = trimmed.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
    if (dailyMotionMatch && dailyMotionMatch[1]) {
      const dmId = dailyMotionMatch[1];
      return `https://www.dailymotion.com/embed/video/${dmId}?autoplay=1`;
    }

    // 4. Google Drive video preview links
    // Formats: https://drive.google.com/file/d/FILE_ID/view -> https://drive.google.com/file/d/FILE_ID/preview
    const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (gdriveMatch && gdriveMatch[1]) {
      return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
    }

    // 5. Streamable links
    // Formats: https://streamable.com/abcde -> https://streamable.com/e/abcde
    const streamableMatch = trimmed.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/i);
    if (streamableMatch && streamableMatch[1]) {
      return `https://streamable.com/e/${streamableMatch[1]}?autoplay=1`;
    }

    // 6. Direct HTTPS or HTTP link
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Relative protocol URL
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}
