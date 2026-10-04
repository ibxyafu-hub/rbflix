import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Plus,
  Check,
  Star,
  Calendar,
  Layers,
  Share2,
  Tv,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BackButton } from '../components/BackButton';
import { contentService } from '../services/contentService';
import { tmdbService, TmdbEnrichedDetails, TmdbCastMember } from '../services/tmdbService';
import { Series, Episode, Season, ContentItem, isSeries } from '../types/content';
import { MoviePosterArt, CinematicBackdropArt, EpisodeThumbnailArt } from '../components/MovieArt';
import { ActorModal } from '../components/ActorModal';

export const SeriesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openPlayer, isInMyList, toggleMyList, showToast } = useApp();

  const [series, setSeries] = useState<Series | null>(null);
  const [enrichedData, setEnrichedData] = useState<TmdbEnrichedDetails | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch series and enriched TMDB metadata
  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    contentService
      .getContentById(id)
      .then(async item => {
        if (!isMounted) return;
        if (item && isSeries(item)) {
          setSeries(item);
          const enriched = await tmdbService.getEnrichedDetails(item);
          if (isMounted) {
            setEnrichedData(enriched);
            if (item.seasons && item.seasons.length > 0) {
              setSelectedSeasonNumber(item.seasons[0].seasonNumber);
            }
            setIsLoading(false);
          }
        } else {
          showToast('Requested series could not be found.');
          navigate('/series', { replace: true });
        }
      })
      .catch(err => {
        console.error('Failed to load series details:', err);
        if (isMounted) {
          showToast('Failed to load series details.');
          navigate('/series', { replace: true });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate, showToast]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/series');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    }
  };

  if (isLoading || !series) {
    return (
      <div className="min-h-screen bg-[#141414] pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Loading Series...</p>
        </div>
      </div>
    );
  }

  const inList = isInMyList(series.id);
  const castList: TmdbCastMember[] = enrichedData?.cast || [];
  const similarSeries: ContentItem[] = enrichedData?.similar || [];

  const seasons = series.seasons || [];
  const currentSeason = seasons.find(s => s.seasonNumber === selectedSeasonNumber) || seasons[0];
  const episodes = currentSeason?.episodes || [];

  // Handle Play for Series: Play S1E1 or the first episode
  const handleMainPlay = () => {
    if (episodes.length > 0 && currentSeason) {
      navigate(`/watch/series/${series.id}/${episodes[0].id}`);
    } else if (seasons.length > 0 && seasons[0].episodes.length > 0) {
      navigate(`/watch/series/${series.id}/${seasons[0].episodes[0].id}`);
    } else {
      navigate(`/watch/series/${series.id}/default`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-[#141414] text-white pb-24 overflow-x-hidden"
    >
      {/* 1. CINEMATIC HERO SECTION */}
      <div className="relative w-full min-h-[580px] lg:min-h-[700px] flex items-end">
        {/* Full-bleed Backdrop with Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <CinematicBackdropArt movie={series} className="h-full w-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 sm:pb-14 w-full">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start md:items-end">
            {/* Series Poster (Desktop & Tablet) */}
            <div className="hidden md:block w-52 lg:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/15 bg-zinc-900 group">
              <MoviePosterArt movie={series} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>

            {/* Series Information Column */}
            <div className="flex-1 space-y-4 max-w-3xl">
              {/* Badge Row */}
              <div className="flex flex-wrap items-center gap-2">
                {series.isOriginal && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e50914] text-white text-[11px] font-black uppercase tracking-wider shadow">
                    <Sparkles className="w-3 h-3" />
                    RBFLIX ORIGINAL SERIES
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-xs font-bold backdrop-blur-xs">
                  {series.quality || '4K Ultra HD'}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-xs font-bold">
                  {series.maturityRating || '16+'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {series.title}
              </h1>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  {series.matchScore || 98}% Match
                </span>

                <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>TMDB {enrichedData?.voteAverage ? enrichedData.voteAverage.toFixed(1) : series.rating.toFixed(1)}</span>
                </span>

                <span className="flex items-center gap-1 text-zinc-300">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{series.year}</span>
                </span>

                <span className="flex items-center gap-1 text-zinc-300">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{seasons.length} Season{seasons.length === 1 ? '' : 's'}</span>
                </span>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {series.genres.map(genre => (
                  <span
                    key={genre}
                    className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 text-xs font-medium backdrop-blur-xs border border-white/10"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Overview / Description */}
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-2xl drop-shadow line-clamp-4 sm:line-clamp-none">
                {enrichedData?.overview || series.description}
              </p>

              {/* Action Buttons: Play S1E1 + Add to My List + Share */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={handleMainPlay}
                  className="flex items-center justify-center gap-2.5 px-7 py-3 bg-white text-black font-extrabold text-sm sm:text-base rounded-md hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-black/60 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={`Play ${series.title}`}
                >
                  <Play className="w-5 h-5 fill-black transition-transform group-hover:scale-110" />
                  <span>Play {episodes[0] ? `S${currentSeason?.seasonNumber || 1} E1` : 'Series'}</span>
                </button>

                <button
                  onClick={() => toggleMyList(series.id)}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md border font-semibold text-sm sm:text-base backdrop-blur-md active:scale-95 transition-all cursor-pointer ${
                    inList
                      ? 'bg-zinc-800/90 text-white border-zinc-600'
                      : 'bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 border-zinc-700/80'
                  }`}
                  aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                >
                  {inList ? <Check className="w-5 h-5 text-[#e50914]" /> : <Plus className="w-5 h-5" />}
                  <span>{inList ? 'In My List' : 'Add to My List'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-md bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-700/80 backdrop-blur-md active:scale-95 transition-colors cursor-pointer"
                  title="Share link"
                  aria-label="Share series link"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEASON / EPISODE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Tv className="w-5 h-5 text-[#e50914]" />
              <span>Episodes</span>
            </h2>
            <span className="text-xs text-zinc-400 font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              {episodes.length} Episode{episodes.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Season Selector Tabs */}
          {seasons.length > 1 ? (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {seasons.map(s => (
                <button
                  key={s.id || s.seasonNumber}
                  onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedSeasonNumber === s.seasonNumber
                      ? 'bg-white text-black shadow-md'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {s.title || `Season ${s.seasonNumber}`}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs font-bold text-zinc-400">Season 1</span>
          )}
        </div>

        {/* Episode Cards Grid / List */}
        {episodes.length > 0 ? (
          <div className="space-y-3">
            {episodes.map(ep => (
              <div
                key={ep.id}
                onClick={() => navigate(`/watch/series/${series.id}/${ep.id}`)}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer select-none"
                role="button"
                tabIndex={0}
                aria-label={`Play Episode ${ep.episodeNumber}: ${ep.title}`}
              >
                {/* Episode Thumbnail */}
                <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800 shadow">
                  {ep.thumbnailUrl ? (
                    <img
                      src={ep.thumbnailUrl}
                      alt={ep.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <EpisodeThumbnailArt
                      gradient={ep.thumbnailGradient || series.backdropGradient}
                      episodeNumber={ep.episodeNumber}
                      duration={ep.duration}
                    />
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Play className="w-4 h-4 fill-black translate-x-0.5" />
                    </div>
                  </div>

                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-zinc-300">
                    {ep.duration || '45m'}
                  </span>
                </div>

                {/* Episode Details */}
                <div className="flex-1 min-w-0 space-y-1 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#e50914] transition-colors truncate">
                      {ep.episodeNumber}. {ep.title}
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono shrink-0 hidden sm:inline">
                      {ep.duration}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                    {ep.description || 'No episode description available.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-zinc-800">
            <p className="text-sm text-zinc-400">No episodes published for this season yet.</p>
          </div>
        )}
      </section>

      {/* 3. CAST / ACTORS SECTION */}
      {castList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Series Cast & Characters</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Click actor for filmography</span>
          </div>

          <div className="overflow-x-auto scrollbar-none flex gap-4 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {castList.map(actor => (
              <div
                key={actor.id}
                onClick={() => setSelectedActor(actor.name)}
                className="group/actor flex flex-col items-center text-center w-28 sm:w-32 shrink-0 p-2.5 rounded-xl hover:bg-zinc-900/60 transition-colors cursor-pointer select-none"
                role="button"
                tabIndex={0}
                aria-label={`View actor details for ${actor.name}`}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-zinc-700/60 group-hover/actor:ring-[#e50914] shadow-md transition-all group-hover/actor:scale-105 mb-2.5">
                  <img
                    src={actor.profileUrl}
                    alt={actor.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover/actor:text-[#e50914] transition-colors line-clamp-1 w-full">
                  {actor.name}
                </h4>
                {actor.character && (
                  <p className="text-[11px] text-[#b3b3b3] font-medium line-clamp-1 w-full mt-0.5">
                    {actor.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. SIMILAR SERIES SECTION */}
      {similarSeries.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Tv className="w-5 h-5 text-[#e50914]" />
              <span>Similar Series</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Recommended series</span>
          </div>

          <div className="overflow-x-auto scrollbar-none flex gap-4 pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {similarSeries.map(similar => (
              <div
                key={similar.id}
                onClick={() => navigate(`/series/${similar.id}`)}
                className="group relative flex-none w-[160px] sm:w-[190px] md:w-[210px] aspect-[2/3] rounded-lg overflow-hidden bg-[#1f1f1f] shadow-lg border border-zinc-800/80 transition-transform duration-300 hover:scale-105 cursor-pointer select-none"
                role="button"
                tabIndex={0}
                aria-label={`View details for ${similar.title}`}
              >
                <MoviePosterArt movie={similar} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {similar.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-300 mt-1 font-semibold">
                    <span>{similar.year}</span>
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {similar.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actor Details Modal */}
      {selectedActor && (
        <ActorModal actorName={selectedActor} onClose={() => setSelectedActor(null)} />
      )}
    </motion.div>
  );
};
