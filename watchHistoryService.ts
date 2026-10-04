import { WatchProgressItem, ContentItem, Episode, isSeries } from '../types/content';

const WATCH_HISTORY_STORAGE_KEY = 'rbflix_watch_history';

/**
 * Service for managing user playback positions and Continue Watching queue.
 * Cleanly separated from the main content repository so it can be synced to a user account DB later.
 */
class WatchHistoryService {
  private getStore(): WatchProgressItem[] {
    try {
      const data = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // Seed initial demo continue-watching items
    return [
      {
        contentId: 'movie-1',
        contentType: 'movie',
        title: 'Neon Nexus: 2099',
        posterGradient: 'from-fuchsia-700 via-indigo-950 to-black',
        playbackPosition: 5630, // seconds
        duration: 8280,
        progressPercentage: 68,
        lastWatched: Date.now() - 1000 * 60 * 30, // 30 mins ago
      },
      {
        contentId: 'series-1',
        contentType: 'series',
        title: 'Interstellar Horizon',
        posterGradient: 'from-cyan-600 via-blue-950 to-black',
        episodeId: 'ep-s1-2',
        seasonNumber: 1,
        episodeNumber: 2,
        episodeTitle: 'Departure from Luna',
        playbackPosition: 2530,
        duration: 2880,
        progressPercentage: 88,
        lastWatched: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      },
      {
        contentId: 'movie-2',
        contentType: 'movie',
        title: 'The Shadow Syndicate',
        posterGradient: 'from-amber-600 via-stone-900 to-black',
        playbackPosition: 2640,
        duration: 7560,
        progressPercentage: 35,
        lastWatched: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      },
      {
        contentId: 'movie-4',
        contentType: 'movie',
        title: 'The Platinum Heist',
        posterGradient: 'from-amber-500 via-stone-900 to-black',
        playbackPosition: 1700,
        duration: 7080,
        progressPercentage: 24,
        lastWatched: Date.now() - 1000 * 60 * 60 * 48,
      },
    ];
  }

  private saveStore(items: WatchProgressItem[]) {
    try {
      localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  getHistory(): WatchProgressItem[] {
    return this.getStore().sort((a, b) => b.lastWatched - a.lastWatched);
  }

  getProgress(contentId: string, episodeId?: string): WatchProgressItem | undefined {
    const history = this.getStore();
    if (episodeId) {
      return history.find(item => item.contentId === contentId && item.episodeId === episodeId);
    }
    return history.find(item => item.contentId === contentId);
  }

  saveProgress(
    content: ContentItem,
    playbackPosition: number,
    duration: number,
    episode?: Episode
  ): WatchProgressItem {
    const history = this.getStore();
    const progressPercentage = duration > 0 ? Math.min(100, Math.round((playbackPosition / duration) * 100)) : 0;

    const existingIndex = history.findIndex(
      item => item.contentId === content.id && (!episode || item.episodeId === episode.id)
    );

    const updatedItem: WatchProgressItem = {
      contentId: content.id,
      contentType: content.type,
      title: content.title,
      posterGradient: content.posterGradient,
      posterUrl: content.posterUrl,
      episodeId: episode?.id,
      seasonNumber: episode?.seasonNumber,
      episodeNumber: episode?.episodeNumber,
      episodeTitle: episode?.title,
      playbackPosition,
      duration,
      progressPercentage,
      lastWatched: Date.now(),
    };

    if (existingIndex >= 0) {
      history[existingIndex] = updatedItem;
    } else {
      history.unshift(updatedItem);
    }

    this.saveStore(history);
    return updatedItem;
  }

  removeProgress(contentId: string, episodeId?: string): void {
    let history = this.getStore();
    if (episodeId) {
      history = history.filter(item => !(item.contentId === contentId && item.episodeId === episodeId));
    } else {
      history = history.filter(item => item.contentId !== contentId);
    }
    this.saveStore(history);
  }
}

export const watchHistoryService = new WatchHistoryService();
