import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  ChevronDown, 
  Star, 
  Calendar, 
  Clock, 
  Info,
  CheckCircle2,
  Users,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BackButton } from '../components/BackButton';
import { contentService } from '../services/contentService';
import { tmdbService, TmdbEnrichedDetails } from '../services/tmdbService';
import { ContentItem, Movie, Series, Episode, Season, isSeries, isMovie } from '../types/content';
import { VideoPlayer } from '../components/VideoPlayer';
import { EpisodeThumbnailArt, MoviePosterArt } from '../components/MovieArt';
import { MovieCard } from '../components/MovieCard';

export const WatchPage: React.FC = () => {
  const { id, seriesId, episodeId } = useParams<{ id?: string; seriesId?: string; episodeId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { openPlayer, activePlayerPayload, showToast, watchHistory } = useApp();

  const [content, setContent] = useState<ContentItem | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [enrichedData, setEnrichedData] = useState<TmdbEnrichedDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if we are watching a movie or a series episode
  const isSeriesWatch = Boolean(seriesId && episodeId);
  const targetId = seriesId || id;

  useEffect(() => {
    let isMounted = true;
    if (!targetId) return;

    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchData = async () => {
      try {
        if (isSeriesWatch && seriesId && episodeId) {
          const res = await contentService.getEpisodeById(seriesId, episodeId);
          if (isMounted && res) {
            setContent(res.series);
            setCurrentEpisode(res.episode);
            setCurrentSeason(res.season);
            setSelectedSeasonNumber(res.season.seasonNumber);
            
            const enriched = await tmdbService.getEnrichedDetails(res.series);
            if (isMounted) setEnrichedData(enriched);
          } else if (isMounted) {
            showToast('Episode not found.');
            navigate('/series', { replace: true });
          }
        } else if (targetId) {
          const item = await contentService.getContentById(targetId);
          if (isMounted && item) {
            setContent(item);
            if (isSeries(item) && item.seasons.length > 0) {
              // If it's a series but no episodeId, default to first episode
              const firstSeason = item.seasons[0];
              const firstEp = firstSeason.episodes[0];
              setCurrentEpisode(firstEp);
              setCurrentSeason(firstSeason);
              setSelectedSeasonNumber(firstSeason.seasonNumber);
              // Navigate to the actual watch URL if it was just /watch/movie/:id or similar
              if (item.type === 'series') {
                navigate(`/watch/series/${item.id}/${firstEp.id}`, { replace: true });
              }
            }
            
            const enriched = await tmdbService.getEnrichedDetails(item);
            if (isMounted) setEnrichedData(enriched);
          } else if (isMounted) {
            showToast('Title not found.');
            navigate('/', { replace: true });
          }
        }
      } catch (err) {
        console.error('Watch Page fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [targetId, seriesId, episodeId, isSeriesWatch, navigate, showToast]);

  const isSeriesContent = isSeries(content);
  const seasons = isSeriesContent ? content.seasons : [];
  const selectedSeason = useMemo(() => 
    seasons.find(s => s.seasonNumber === selectedSeasonNumber) || (seasons.length > 0 ? seasons[0] : null)
  , [seasons, selectedSeasonNumber]);

  const handleEpisodeSelect = (ep: Episode, s: Season) => {
    if (isSeries(content)) {
      navigate(`/watch/series/${content.id}/${ep.id}`);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(isSeries(content) ? `/series/${content?.id}` : `/movie/${content?.id}`);
    }
  };

  const similarContent = enrichedData?.similar || [];

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-[#07070b] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-black text-white tracking-widest uppercase italic italic">Initializing Theater</p>
            <p className="text-sm text-zinc-500 font-medium max-w-xs mx-auto leading-relaxed">
              Preparing your cinematic experience. This may take a few moments depending on your connection.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white selection:bg-[#e50914] selection:text-white">
      {/* 1. TOP HEADER SECTION */}
      <header className="sticky top-0 z-50 bg-[#07070b]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center gap-4 sm:gap-8">
          <BackButton fallbackPath="/" className="shrink-0" />
          
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight truncate uppercase italic leading-none drop-shadow-md">
              {content.title}
            </h1>
            {isSeriesContent && currentEpisode && (
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-sm">
                S{currentEpisode.seasonNumber} : E{currentEpisode.episodeNumber} — {currentEpisode.title}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto pb-24">
        {/* 2. CINEMATIC VIDEO PLAYER SECTION */}
        <section className="w-full bg-black relative group/player overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-b border-white/5">
          <div className="aspect-video w-full max-h-[88vh] mx-auto bg-black flex items-center justify-center relative z-10">
            <VideoPlayer 
              content={content} 
              episode={currentEpisode || undefined} 
              season={currentSeason || undefined} 
              onClose={handleBack}
              onNextEpisode={(nextEp, nextSeason) => handleEpisodeSelect(nextEp, nextSeason)}
              inline={true}
            />
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8 mt-10 sm:mt-16 space-y-16 sm:space-y-24">
          {/* 3. MOVIE OR TV SHOW INFORMATION SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 sm:gap-16 items-start">
            {/* Poster Card */}
            <div className="hidden lg:block w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group/poster relative">
              <MoviePosterArt movie={content} className="h-full w-full object-cover transition-transform duration-700 group-hover/poster:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>

            {/* Content Details */}
            <div className="space-y-8 sm:space-y-10">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  {content.isOriginal && (
                    <span className="px-3 py-1 bg-[#e50914] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded shadow-xl">Original</span>
                  )}
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
                    {content.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm font-black text-zinc-400">
                  <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded tracking-widest">{content.matchScore || 98}% Match</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-600" />
                    {content.year}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {enrichedData?.voteAverage ? enrichedData.voteAverage.toFixed(1) : content.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-600" />
                    {isSeries(content) ? `${content.seasons.length} Seasons` : (content as Movie).duration}
                  </span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-3">
                  {content.genres.map(g => (
                    <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.15em] border border-white/5 hover:bg-white/10 transition-all cursor-default">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="max-w-4xl">
                <p className="text-zinc-400 leading-relaxed text-base sm:text-xl font-medium italic">
                  {isSeries(content) && currentEpisode ? (
                    <>
                      <span className="text-[#e50914] font-black mr-3 uppercase text-sm tracking-[0.2em] not-italic">S{currentEpisode.seasonNumber}:E{currentEpisode.episodeNumber} —</span>
                      {currentEpisode.description}
                    </>
                  ) : (enrichedData?.overview || content.description)}
                </p>
              </div>

              {/* Cast & Crew Mini Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Director / Creator</span>
                  <p className="text-zinc-200 text-sm font-black">{content.director || (content as any).creator || 'Global Cinematic Team'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Lead Cast</span>
                  <p className="text-zinc-300 text-sm font-bold leading-relaxed line-clamp-2">
                    {content.cast.slice(0, 5).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* TV SHOW EPISODE SELECTOR SECTION (If applicable) */}
          {isSeries(content) && (
            <section className="space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">Episodes</h3>
                  <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
                  <div className="relative group/season">
                    <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:border-[#e50914] transition-all text-sm font-black uppercase tracking-widest">
                      Season {selectedSeasonNumber}
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/season:opacity-100 group-hover/season:translate-y-0 group-hover/season:pointer-events-auto transition-all z-50 overflow-hidden backdrop-blur-xl">
                      {content.seasons.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                          className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#e50914] hover:text-white transition-colors border-b border-white/5 last:border-0 ${selectedSeasonNumber === s.seasonNumber ? 'bg-zinc-800 text-[#e50914]' : 'text-zinc-500'}`}
                        >
                          Season {s.seasonNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  {selectedSeason?.episodes.length} Episodes Available
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {selectedSeason?.episodes.map((ep) => {
                  const isActive = currentEpisode?.id === ep.id;
                  const historyItem = watchHistory.find(h => h.contentId === content.id && h.episodeId === ep.id);
                  const progress = historyItem?.progressPercentage || 0;
                  
                  return (
                    <motion.div
                      key={ep.id}
                      whileHover={{ y: -4 }}
                      onClick={() => handleEpisodeSelect(ep, selectedSeason)}
                      className={`group/ep relative flex flex-col rounded-2xl overflow-hidden bg-zinc-900/40 border transition-all cursor-pointer ${isActive ? 'border-[#e50914] ring-1 ring-[#e50914]' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <div className="relative aspect-video overflow-hidden bg-zinc-800">
                        <EpisodeThumbnailArt episodeNumber={ep.episodeNumber} duration={ep.duration} className="transition-transform duration-500 group-hover/ep:scale-110" />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover/ep:opacity-100'}`}>
                          <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-2xl">
                            <Play className="w-6 h-6 fill-current translate-x-0.5" />
                          </div>
                        </div>
                        {progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/80">
                            <div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black truncate uppercase italic">{ep.title}</h4>
                          <span className="text-[10px] font-black text-zinc-500 shrink-0">E{ep.episodeNumber}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                          {ep.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 4. MORE LIKE THIS SECTION */}
          {similarContent.length > 0 && (
            <section className="space-y-10 pb-12">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter shrink-0">More Like This</h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="relative group/rec-row">
                <button 
                  onClick={() => {
                    const el = document.getElementById('rec-row');
                    if (el) el.scrollBy({ left: -500, behavior: 'smooth' });
                  }}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/rec-row:opacity-100 transition-all hover:bg-[#e50914] hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xl hidden lg:flex"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div 
                  id="rec-row"
                  className="flex gap-6 overflow-x-auto no-scrollbar pb-10 scroll-smooth snap-x snap-mandatory"
                >
                  {similarContent.map((item) => (
                    <div 
                      key={item.id} 
                      className="snap-start shrink-0 cursor-pointer"
                      onClick={() => navigate(item.type === 'series' ? `/series/${item.id}` : `/movie/${item.id}`)}
                    >
                      <div className="w-[160px] sm:w-[220px] space-y-4 group/item">
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl relative transition-all duration-500 group-hover/item:border-[#e50914]/50 group-hover/item:shadow-[#e50914]/10 group-hover/item:-translate-y-2">
                          <MoviePosterArt movie={item} showDetails={false} className="h-full w-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transform scale-90 group-hover/item:scale-100 transition-transform">
                              <Info className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                        <div className="px-1">
                          <h4 className="text-xs sm:text-sm font-black truncate text-white uppercase italic tracking-tight group-hover/item:text-[#e50914] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1">
                            {item.year}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const el = document.getElementById('rec-row');
                    if (el) el.scrollBy({ left: 500, behavior: 'smooth' });
                  }}
                  className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/rec-row:opacity-100 transition-all hover:bg-[#e50914] hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xl hidden lg:flex"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
