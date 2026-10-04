/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
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
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { VideoPlayer } from './components/VideoPlayer';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { contentService } from './services/contentService';
import { Episode, Season } from './types/content';
import { AnimatePresence } from 'framer-motion';

/**
 * Route handler for direct /watch/movie/:id route
 */
const WatchMovieRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activePlayerPayload, openPlayer, closePlayer, showToast } = useApp();

  useEffect(() => {
    if (id && (!activePlayerPayload || activePlayerPayload.content.id !== id)) {
      contentService.getMovieById(id).then(movie => {
        if (movie) {
          openPlayer(movie);
        } else {
          showToast('Requested movie is unavailable.');
          navigate('/movies', { replace: true });
        }
      });
    }
  }, [id, activePlayerPayload, openPlayer, navigate, showToast]);

  const handleClose = () => {
    closePlayer();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/movies', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {activePlayerPayload && (
          <VideoPlayer
            key={activePlayerPayload.content.id}
            movie={activePlayerPayload.content}
            content={activePlayerPayload.content}
            episode={activePlayerPayload.episode}
            season={activePlayerPayload.season}
            initialTime={activePlayerPayload.initialTime}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Route handler for direct /watch/series/:seriesId/:episodeId route
 */
const WatchSeriesRoute: React.FC = () => {
  const { seriesId, episodeId } = useParams<{ seriesId: string; episodeId: string }>();
  const navigate = useNavigate();
  const { activePlayerPayload, openPlayer, closePlayer, showToast } = useApp();

  useEffect(() => {
    if (seriesId && episodeId) {
      contentService.getEpisodeById(seriesId, episodeId).then(res => {
        if (res) {
          openPlayer(res.series, res.episode, res.season);
        } else {
          showToast('Requested episode is unavailable.');
          navigate('/series', { replace: true });
        }
      });
    }
  }, [seriesId, episodeId, openPlayer, navigate, showToast]);

  const handleNextEpisode = (nextEp: Episode, nextSeason: Season) => {
    if (seriesId) {
      navigate(`/watch/series/${seriesId}/${nextEp.id}`, { replace: true });
    }
  };

  const handleClose = () => {
    closePlayer();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/series', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {activePlayerPayload && (
          <VideoPlayer
            key={activePlayerPayload.content.id + (activePlayerPayload.episode?.id || '')}
            movie={activePlayerPayload.content}
            content={activePlayerPayload.content}
            episode={activePlayerPayload.episode}
            season={activePlayerPayload.season}
            initialTime={activePlayerPayload.initialTime}
            onNextEpisode={handleNextEpisode}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

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

  // Determine active navigation tab from URL pathname
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.startsWith('/movies') || path.startsWith('/movie/')) return 'movies';
    if (path.startsWith('/series')) return 'series';
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
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans selection:bg-[#e50914] selection:text-white antialiased overflow-x-hidden">
      {/* Fixed Navbar */}
      <Navbar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/series/:id" element={<SeriesDetailPage />} />
          <Route path="/my-list" element={<MyListPage onNavigateHome={() => handleTabChange('home')} />} />
          <Route path="/search" element={<SearchPage onClearSearch={handleClearSearch} />} />
          <Route path="/watch/movie/:id" element={<WatchMovieRoute />} />
          <Route path="/watch/series/:seriesId/:episodeId" element={<WatchSeriesRoute />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Global Cinematic Footer */}
      <Footer />

      {/* Movie / Series Details Modal */}
      {activeModalItem && (
        <MovieDetailsModal movie={activeModalItem} onClose={handleModalClose} />
      )}

      {/* Fullscreen Video Player Modal (Triggered inside views) */}
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
