import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ContentItem, Movie, Series, Episode, Season, UserProfile, VideoPlayerPayload, WatchProgressItem } from '../types/content';
import { watchlistService } from '../services/watchlistService';
import { watchHistoryService } from '../services/watchHistoryService';
import { contentService } from '../services/contentService';

interface AppContextType {
  // Watchlist (My List)
  myList: string[];
  isInMyList: (id: string) => boolean;
  toggleMyList: (id: string) => void;
  addToMyList: (id: string) => void;
  removeFromMyList: (id: string) => void;

  // Likes
  likedIds: string[];
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;

  // Continue Watching
  watchHistory: WatchProgressItem[];
  saveProgress: (content: ContentItem, playbackPosition: number, duration: number, episode?: Episode) => void;
  removeProgress: (contentId: string, episodeId?: string) => void;
  updateProgress: (movieId: string, progressPercentage: number) => void; // legacy support

  // Modal (Movie or Series Details)
  activeModalItem: ContentItem | null;
  activeModalMovie: Movie | null; // legacy alias
  openModal: (item: ContentItem) => void;
  closeModal: () => void;

  // Video Player
  activePlayerPayload: VideoPlayerPayload | null;
  activePlayerMovie: ContentItem | null; // legacy alias
  openPlayer: (content: ContentItem, episode?: Episode, season?: Season, initialTime?: number) => void;
  closePlayer: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // User Profile & Auth
  user: UserProfile;
  login: (email: string, name?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Toast
  toast: string | null;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'rbflix_user';
const LOCAL_STORAGE_LIKES_KEY = 'rbflix_likes';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Watchlist State
  const [myList, setMyList] = useState<string[]>(() => watchlistService.getWatchlist());

  // Likes State
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['movie-1', 'series-1'];
  });

  // Watch History State
  const [watchHistory, setWatchHistory] = useState<WatchProgressItem[]>(() =>
    watchHistoryService.getHistory()
  );

  // Modal State (Movie / Series)
  const [activeModalItem, setActiveModalItem] = useState<ContentItem | null>(null);

  // Video Player Payload
  const [activePlayerPayload, setActivePlayerPayload] = useState<VideoPlayerPayload | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Feedback State
  const [toast, setToast] = useState<string | null>(null);

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      name: 'Alex Rivera',
      email: 'alex.rivera@rbflix.stream',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isLoggedIn: true,
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast Helper
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(prev => (prev === message ? null : prev));
    }, 2800);
  }, []);

  // Sync Likes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LIKES_KEY, JSON.stringify(likedIds));
    } catch {
      // ignore
    }
  }, [likedIds]);

  // Sync User
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  // Watchlist Actions
  const addToMyList = useCallback(
    async (id: string) => {
      watchlistService.addToWatchlist(id);
      setMyList(watchlistService.getWatchlist());
      const item = await contentService.getContentById(id);
      showToast(`Added "${item?.title || 'Title'}" to My List`);
    },
    [showToast]
  );

  const removeFromMyList = useCallback(
    async (id: string) => {
      watchlistService.removeFromWatchlist(id);
      setMyList(watchlistService.getWatchlist());
      const item = await contentService.getContentById(id);
      showToast(`Removed "${item?.title || 'Title'}" from My List`);
    },
    [showToast]
  );

  const toggleMyList = useCallback(
    async (id: string) => {
      const added = watchlistService.toggleWatchlist(id);
      setMyList(watchlistService.getWatchlist());
      const item = await contentService.getContentById(id);
      if (added) {
        showToast(`Added "${item?.title || 'Title'}" to My List`);
      } else {
        showToast(`Removed "${item?.title || 'Title'}" from My List`);
      }
    },
    [showToast]
  );

  const isInMyList = useCallback(
    (id: string) => myList.includes(id),
    [myList]
  );

  // Likes Actions
  const toggleLike = useCallback(
    async (id: string) => {
      const item = await contentService.getContentById(id);
      if (likedIds.includes(id)) {
        setLikedIds(prev => prev.filter(itemKey => itemKey !== id));
        showToast(`Removed like from "${item?.title || 'Title'}"`);
      } else {
        setLikedIds(prev => [...prev, id]);
        showToast(`You liked "${item?.title || 'Title'}"`);
      }
    },
    [likedIds, showToast]
  );

  const isLiked = useCallback(
    (id: string) => likedIds.includes(id),
    [likedIds]
  );

  // Continue Watching Actions
  const saveProgress = useCallback(
    (content: ContentItem, playbackPosition: number, duration: number, episode?: Episode) => {
      watchHistoryService.saveProgress(content, playbackPosition, duration, episode);
      setWatchHistory(watchHistoryService.getHistory());
    },
    []
  );

  const removeProgress = useCallback((contentId: string, episodeId?: string) => {
    watchHistoryService.removeProgress(contentId, episodeId);
    setWatchHistory(watchHistoryService.getHistory());
  }, []);

  const updateProgress = useCallback(
    async (movieId: string, progressPercentage: number) => {
      const item = await contentService.getContentById(movieId);
      if (item) {
        const estDuration = 7200;
        const pos = Math.round((progressPercentage / 100) * estDuration);
        saveProgress(item, pos, estDuration);
      }
    },
    [saveProgress]
  );

  // Modal Actions
  const openModal = useCallback((item: ContentItem) => {
    setActiveModalItem(item);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModalItem(null);
  }, []);

  // Player Actions
  const openPlayer = useCallback(
    (content: ContentItem, episode?: Episode, season?: Season, initialTime?: number) => {
      setActivePlayerPayload({
        content,
        episode,
        season,
        initialTime,
      });
    },
    []
  );

  const closePlayer = useCallback(() => {
    setActivePlayerPayload(null);
  }, []);

  // Auth Actions
  const login = useCallback(
    (email: string, name?: string) => {
      const displayName = name || email.split('@')[0];
      const newUser: UserProfile = {
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        email,
        avatarUrl: '',
        isLoggedIn: true,
      };
      setUser(newUser);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${newUser.name}!`);
    },
    [showToast]
  );

  const logout = useCallback(() => {
    setUser({
      name: 'Guest',
      email: '',
      avatarUrl: '',
      isLoggedIn: false,
    });
    showToast('Signed out of RBflix');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        myList,
        isInMyList,
        toggleMyList,
        addToMyList,
        removeFromMyList,
        likedIds,
        isLiked,
        toggleLike,
        watchHistory,
        saveProgress,
        removeProgress,
        updateProgress,
        activeModalItem,
        activeModalMovie: activeModalItem as Movie | null,
        openModal,
        closeModal,
        activePlayerPayload,
        activePlayerMovie: activePlayerPayload?.content || null,
        openPlayer,
        closePlayer,
        searchQuery,
        setSearchQuery,
        user,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
