/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { SeriesPage } from './pages/SeriesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { MyListPage } from './pages/MyListPage';
import { SearchPage } from './pages/SearchPage';
import { WatchPage } from './pages/WatchPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfUsePage } from './pages/TermsOfUsePage';
import { AdminSubtitlePage } from './pages/AdminSubtitlePage';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { VideoPlayer } from './components/VideoPlayer';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { contentService } from './services/contentService';
import { Episode, Season } from './types/content';
import { AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    activeModalItem,
    closeModal,
    activePlayerPayload,
    closePlayer,
    openPlayer,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Trigger top loading bar on route change
  useEffect(() => {
    setIsLoadingRoute(true);
    const timer = setTimeout(() => setIsLoadingRoute(false), 1300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Monitor scroll for Back-to-Top button (>600px)
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.startsWith('/movies') || path.startsWith('/movie/') || path.startsWith('/watch/movie/')) return 'movies';
    if (path.startsWith('/series') || path.startsWith('/watch/series/')) return 'series';
    if (path.startsWith('/my-list')) return 'mylist';
    if (path.startsWith('/search') || searchQuery.trim().length > 0) return 'search';
    return 'home';
  };

  const currentTab = getCurrentTab();

  const handleTabChange = (tab: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'movies':
        navigate('/movies');
        break;
      case 'series':
        navigate('/series');
        break;
      case 'mylist':
        navigate('/my-list');
        break;
      case 'search':
        navigate('/search');
        break;
      default:
        navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextEpisode = (nextEp: Episode, nextSeason: Season) => {
    if (activePlayerPayload?.content) {
      openPlayer(activePlayerPayload.content, nextEp, nextSeason);
    }
  };

  const handleModalClose = () => {
    closeModal();
    if (location.pathname.startsWith('/movie/') || location.pathname.startsWith('/series/')) {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate(location.pathname.startsWith('/series/') ? '/series' : '/movies');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans selection:bg-[#e50914] selection:text-white antialiased overflow-x-hidden relative">
      {/* Top 3px Loading Indicator */}
      {isLoadingRoute && <div className="top-loader" />}

      {/* Fixed Navbar */}
      {!location.pathname.includes('/watch/') && (
        <Navbar currentTab={currentTab} onTabChange={handleTabChange} />
      )}

      {/* Main Content Area */}
      <main 
        className="flex-1 transition-opacity duration-300 ease-[var(--ease)]"
        style={{ opacity: isLoadingRoute ? 0 : 1 }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/series/:id" element={<SeriesDetailPage />} />
          <Route path="/my-list" element={<MyListPage onNavigateHome={() => handleTabChange('home')} />} />
          <Route path="/search" element={<SearchPage onClearSearch={handleClearSearch} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/watch/movie/:id" element={<WatchPage />} />
          <Route path="/watch/series/:seriesId/:episodeId" element={<WatchPage />} />
          <Route path="/admin/subtitles" element={<AdminSubtitlePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Global Cinematic Footer */}
      <Footer />

      {/* Movie / Series Details Modal */}
      {activeModalItem && (
        <MovieDetailsModal movie={activeModalItem} onClose={handleModalClose} />
      )}

      {/* Fullscreen Video Player Modal */}
      <AnimatePresence mode="wait">
        {activePlayerPayload && !location.pathname.startsWith('/watch/') && (
          <VideoPlayer
            key={activePlayerPayload.content.id + (activePlayerPayload.episode?.id || '')}
            movie={activePlayerPayload.content}
            content={activePlayerPayload.content}
            episode={activePlayerPayload.episode}
            season={activePlayerPayload.season}
            initialTime={activePlayerPayload.initialTime}
            onNextEpisode={handleNextEpisode}
            onClose={closePlayer}
          />
        )}
      </AnimatePresence>

      {/* Login / Sign Up Dialog */}
      <AuthModal />

      {/* Feedback Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
