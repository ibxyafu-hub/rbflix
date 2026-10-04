const WATCHLIST_STORAGE_KEY = 'rbflix_user_watchlist';

/**
 * Service for managing the user's Watchlist / My List.
 * Abstracted so that connecting to a user database later only requires updating this service.
 */
class WatchlistService {
  private getStore(): string[] {
    try {
      const data = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    // Default starter watchlist
    return ['movie-1', 'series-1', 'movie-3', 'series-4'];
  }

  private saveStore(ids: string[]): void {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }

  getWatchlist(): string[] {
    return this.getStore();
  }

  isInWatchlist(id: string): boolean {
    return this.getStore().includes(id);
  }

  addToWatchlist(id: string): void {
    const list = this.getStore();
    if (!list.includes(id)) {
      list.push(id);
      this.saveStore(list);
    }
  }

  removeFromWatchlist(id: string): void {
    const list = this.getStore().filter(item => item !== id);
    this.saveStore(list);
  }

  toggleWatchlist(id: string): boolean {
    if (this.isInWatchlist(id)) {
      this.removeFromWatchlist(id);
      return false;
    } else {
      this.addToWatchlist(id);
      return true;
    }
  }
}

export const watchlistService = new WatchlistService();
