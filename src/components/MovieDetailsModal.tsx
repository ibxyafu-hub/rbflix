import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, Play, Plus, Check, ThumbsUp, Star, Share2, Film, Tv, Clock } from 'lucide-react';
import { ContentItem, Movie, Series, Episode, Season, isSeries } from '../types/content';
import { useApp } from '../context/AppContext';
import { contentService } from '../services/contentService';
import { MoviePosterArt, CinematicBackdropArt, EpisodeThumbnailArt } from './MovieArt';

interface MovieDetailsModalProps {
  movie: ContentItem;
  onClose: () => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie: initialMovie, onClose }) => {
  const {
    openPlayer,
    isInMyList,
    toggleMyList,
    isLiked,
    toggleLike,
    showToast,
  } = useApp();

  const navigate = useNavigate();

  // Internal history stack for exploring related titles within modal
  const [historyStack, setHistoryStack] = useState<ContentItem[]>([initialMovie]);
  const currentMovie = historyStack[historyStack.length - 1];

  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const inList = isInMyList(currentMovie.id);
  const liked = isLiked(currentMovie.id);

  const isSeriesContent = isSeries(currentMovie);
  const series = isSeriesContent ? (currentMovie as Series) : null;

  // Selected season for series
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
  const [isContentVisible, setIsContentVisible] = useState(false);

  // When initialMovie prop changes from parent
  useEffect(() => {
    setHistoryStack([initialMovie]);
    setSelectedSeasonNumber(1);
  }, [initialMovie]);

  useEffect(() => {
    const timer = setTimeout(() => setIsContentVisible(true), 250);
    return () => clearTimeout(timer);
  }, []);

  // Load related items via contentService whenever current movie in stack changes
  useEffect(() => {
    let isMounted = true;
    contentService.getRelatedContent(currentMovie, 6).then(items => {
      if (isMounted) setRelatedContent(items);
    });
    // Scroll modal to top when switching title
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return () => {
      isMounted = false;
    };
  }, [currentMovie]);

  // Esc key listener & scroll management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (historyStack.length > 1) {
          handleBack();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [historyStack, onClose]);

  // Navigate back one step in modal history or close
  const handleBack = () => {
    if (historyStack.length > 1) {
      setHistoryStack(prev => prev.slice(0, -1));
    } else {
      onClose();
    }
  };

  // Push new related title onto modal stack
  const handleSelectRelated = (item: ContentItem) => {
    setHistoryStack(prev => [...prev, item]);
    setSelectedSeasonNumber(1);
  };

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${currentMovie.title} on RBflix`,
        text: currentMovie.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const handleMainPlay = () => {
    onClose();
    if (isSeriesContent) {
      if (series?.seasons && series.seasons.length > 0) {
        const activeSeason = series.seasons.find(s => s.seasonNumber === selectedSeasonNumber) || series.seasons[0];
        const activeEpisode = activeSeason?.episodes?.[0];
        if (activeEpisode) {
          navigate(`/watch/series/${currentMovie.id}/${activeEpisode.id}`);
        } else {
          navigate(`/watch/series/${currentMovie.id}/default`);
        }
      }
    } else {
      navigate(`/watch/movie/${currentMovie.id}`);
    }
  };

  const handleEpisodePlay = (season: Season, episode: Episode) => {
    onClose();
    navigate(`/watch/series/${currentMovie.id}/${episode.id}`);
  };

  const handleMyListClick = () => {
    const btn = document.getElementById('mylist-btn');
    if (btn) {
      btn.style.animation = 'popScale 0.4s var(--ease)';
      setTimeout(() => { btn.style.animation = ''; }, 400);
    }
    toggleMyList(currentMovie.id);
  };

  // Get active season & its episodes
  const currentSeason = series?.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || series?.seasons?.[0];

  const durationDisplay = isSeriesContent
    ? `${series?.seasons?.length || 1} ${(series?.seasons?.length || 1) === 1 ? 'Season' : 'Seasons'}`
    : (currentMovie as Movie).duration || '2h';

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 transition-opacity duration-[var(--dur)] ease-[var(--ease)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-movie-title"
    >
      <div
        ref={modalRef}
        style={{ 
          transition: 'opacity var(--dur) var(--ease), transform var(--dur) var(--ease)',
          transform: isContentVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: isContentVisible ? 1 : 0
        }}
        className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-[#181818] rounded-xl overflow-hidden shadow-2xl border border-zinc-700/80 flex flex-col my-auto"
      >
        {/* Navigation Action Bar Top (Back & Close Buttons) */}
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-40 flex items-center justify-between pointer-events-none">
          {/* Back Arrow Button (Visible if navigated inside modal or to return) */}
          {historyStack.length > 1 ? (
            <button
              onClick={handleBack}
              className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-zinc-600/80 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl backdrop-blur-sm"
              aria-label="Go back to previous title"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div />
          )}

          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-zinc-600/80 transition-all hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer shadow-xl backdrop-blur-sm ml-auto"
            aria-label="Close details modal"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content Container with Hidden Scrollbar */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        >
          {/* Modal Hero / Backdrop Area */}
          <div className="relative w-full h-[260px] sm:h-[360px] md:h-[420px] overflow-hidden shrink-0">
            <CinematicBackdropArt movie={currentMovie} className="h-full" />

            {/* Scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#181818] via-[#181818]/60 to-transparent w-3/4" />

            {/* Hero Content Overlay */}
            <div 
              style={{ 
                transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
                transitionDelay: '100ms',
                opacity: isContentVisible ? 1 : 0,
                transform: isContentVisible ? 'translateY(0)' : 'translateY(22px)'
              }}
              className="absolute bottom-5 sm:bottom-8 left-5 sm:left-8 right-5 z-20 space-y-3"
            >
              <div className="flex items-center gap-2">
                {currentMovie.isOriginal && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#e50914] bg-black/60 px-2 py-0.5 rounded border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]" />
                    RBFLIX ORIGINAL
                  </span>
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 bg-black/50 px-2 py-0.5 rounded border border-zinc-700/40">
                  {isSeriesContent ? 'TV SERIES' : 'FEATURE FILM'}
                </span>
              </div>

              <h2
                id="modal-movie-title"
                className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md"
              >
                {currentMovie.title}
              </h2>

              {/* Quick action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <button
                  onClick={handleMainPlay}
                  className="flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 bg-white text-black font-bold text-sm sm:text-base rounded-md hover:bg-zinc-200 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black translate-x-0.2" />
                  <span>{isSeriesContent ? 'Play S1:E1' : 'Play'}</span>
                </button>

                <button
                  id="mylist-btn"
                  onClick={handleMyListClick}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    inList
                      ? 'border-[#e50914] bg-[#e50914]/20 text-[#e50914]'
                      : 'border-zinc-500 hover:border-white text-white bg-black/50'
                  }`}
                  title={inList ? 'Remove from My List' : 'Add to My List'}
                  aria-label="Add or remove from my list"
                >
                  {inList ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <button
                  onClick={() => toggleLike(currentMovie.id)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    liked
                      ? 'border-red-500 bg-red-500/20 text-red-500'
                      : 'border-zinc-500 hover:border-white text-white bg-black/50'
                  }`}
                  title={liked ? 'Unlike' : 'Like'}
                  aria-label="Like or unlike title"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  onClick={handleShare}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-500 hover:border-white text-white bg-black/50 flex items-center justify-center transition-all cursor-pointer"
                  title="Share title"
                  aria-label="Share content"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Body / Metadata & Synopsis */}
          <div className="px-5 sm:px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Left 2 cols: Synopsis & Badges */}
              <div 
                style={{ 
                  transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
                  transitionDelay: '200ms',
                  opacity: isContentVisible ? 1 : 0,
                  transform: isContentVisible ? 'translateY(0)' : 'translateY(22px)'
                }}
                className="md:col-span-2 space-y-4"
              >
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-300">
                  <span className="text-emerald-400 font-bold">{currentMovie.matchScore || 98}% Match</span>
                  <span>{currentMovie.year}</span>
                  <span>{durationDisplay}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider border border-zinc-500/60 rounded text-zinc-300">
                    {currentMovie.quality || '4K Ultra HD'}
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {currentMovie.rating} / 10
                  </span>
                </div>

                <p className="text-xs sm:text-sm md:text-base text-zinc-200 leading-relaxed">
                  {currentMovie.description}
                </p>
              </div>

              {/* Right 1 col: Cast, Director, Genres */}
              <div 
                style={{ 
                  transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
                  transitionDelay: '300ms',
                  opacity: isContentVisible ? 1 : 0,
                  transform: isContentVisible ? 'translateY(0)' : 'translateY(22px)'
                }}
                className="space-y-2.5 text-xs sm:text-sm border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6"
              >
                <div>
                  <span className="text-zinc-500">Cast: </span>
                  <span className="text-zinc-300">{currentMovie.cast?.join(', ') || 'N/A'}</span>
                </div>

                {currentMovie.director && (
                  <div>
                    <span className="text-zinc-500">Director: </span>
                    <span className="text-zinc-300">{currentMovie.director}</span>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500">Genres: </span>
                  <span className="text-zinc-300">{currentMovie.genres?.join(', ') || 'General'}</span>
                </div>

                <div>
                  <span className="text-zinc-500">Audio: </span>
                  <span className="text-zinc-300">English [Original], Dolby Atmos 5.1</span>
                </div>

                <div>
                  <span className="text-zinc-500">Subtitles: </span>
                  <span className="text-zinc-300">English [CC], Spanish, French</span>
                </div>
              </div>
            </div>

            {/* SERIES DETAILS EXPERIENCE: SEASONS & EPISODES LIST */}
            {isSeriesContent && series && series.seasons && series.seasons.length > 0 && (
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-[#e50914]" />
                    <h3 className="text-lg sm:text-xl font-bold text-white">Episodes</h3>
                  </div>

                  {/* Season selector */}
                  {series.seasons.length > 1 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Season:</span>
                      <select
                        value={selectedSeasonNumber}
                        onChange={e => setSelectedSeasonNumber(Number(e.target.value))}
                        className="bg-zinc-800 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                      >
                        {series.seasons.map(s => (
                          <option key={s.id} value={s.seasonNumber}>
                            Season {s.seasonNumber} ({s.episodes?.length || 0} Episodes)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium">
                      Season 1 ({currentSeason?.episodes?.length || 0} Episodes)
                    </span>
                  )}
                </div>

                {/* Episodes List Grid */}
                <div className="space-y-2.5 pt-2">
                  {currentSeason?.episodes?.map(episode => (
                    <div
                      key={episode.id}
                      onClick={() => handleEpisodePlay(currentSeason, episode)}
                      className="group/ep flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-lg bg-[#202020] hover:bg-[#282828] border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer"
                    >
                      {/* Episode Number */}
                      <span className="hidden sm:inline text-lg font-mono font-bold text-zinc-500 group-hover/ep:text-white w-6 text-center">
                        {episode.episodeNumber}
                      </span>

                      {/* Thumbnail Art */}
                      <div className="w-full sm:w-36 h-20 sm:h-20 shrink-0 rounded overflow-hidden">
                        <EpisodeThumbnailArt
                          gradient={episode.thumbnailGradient || currentMovie.posterGradient}
                          episodeNumber={episode.episodeNumber}
                          duration={episode.duration}
                        />
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-white group-hover/ep:text-[#e50914] transition-colors">
                            <span className="sm:hidden text-zinc-500 mr-2">{episode.episodeNumber}.</span>
                            {episode.title}
                          </h4>
                          <span className="text-xs text-zinc-400 shrink-0 font-mono hidden sm:inline">
                            {episode.duration}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {episode.description}
                        </p>
                      </div>

                      {/* Play Action */}
                      <div
                        className="self-end sm:self-center p-2 rounded-full bg-zinc-800 group-hover/ep:bg-[#e50914] text-white transition-colors cursor-pointer"
                        title={`Play Episode ${episode.episodeNumber}`}
                      >
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* "More Like This" Section */}
            {relatedContent.length > 0 && (
              <div className="pt-6 border-t border-zinc-800">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                  More Like This
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {relatedContent.map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => handleSelectRelated(rel)}
                      className="group bg-[#232323] rounded-md overflow-hidden border border-zinc-700/60 hover:border-zinc-500 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <div className="h-28 sm:h-36 relative">
                        <MoviePosterArt movie={rel} showDetails={false} className="h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#232323] via-transparent to-transparent" />

                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] text-emerald-400 font-bold bg-black/70 px-1.5 py-0.5 rounded">
                            {rel.matchScore || 95}% Match
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-[#e50914] transition-colors">
                          {rel.title}
                        </h4>

                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {rel.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                          <span>{rel.year}</span>
                          <span>
                            {isSeries(rel)
                              ? `${rel.seasons?.length || 1} Season(s)`
                              : (rel as Movie).duration || '2h'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
