import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  Shield,
  Share2,
  Film,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BackButton } from '../components/BackButton';
import { contentService } from '../services/contentService';
import { tmdbService, TmdbEnrichedDetails, TmdbCastMember } from '../services/tmdbService';
import { Movie, ContentItem, isMovie } from '../types/content';
import { MoviePosterArt, CinematicBackdropArt } from '../components/MovieArt';
import { ActorModal } from '../components/ActorModal';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openPlayer, isInMyList, toggleMyList, showToast } = useApp();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [enrichedData, setEnrichedData] = useState<TmdbEnrichedDetails | null>(null);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch movie and enriched TMDB metadata
  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    contentService
      .getContentById(id)
      .then(async item => {
        if (!isMounted) return;
        if (item && isMovie(item)) {
          setMovie(item);
          const enriched = await tmdbService.getEnrichedDetails(item);
          if (isMounted) {
            setEnrichedData(enriched);
            setIsLoading(false);
          }
        } else {
          showToast('Requested title could not be found.');
          navigate('/movies', { replace: true });
        }
      })
      .catch(err => {
        console.error('Failed to load movie details:', err);
        if (isMounted) {
          showToast('Failed to load movie details.');
          navigate('/movies', { replace: true });
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
      navigate('/movies');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    }
  };

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Loading Title...</p>
        </div>
      </div>
    );
  }

  const inList = isInMyList(movie.id);
  const castList: TmdbCastMember[] = enrichedData?.cast || [];
  const similarMovies: ContentItem[] = enrichedData?.similar || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-[#141414] text-white pb-24 overflow-x-hidden"
    >
      {/* 1. CINEMATIC HERO SECTION */}
      <div className="relative w-full min-h-[580px] lg:min-h-[700px] flex items-end">
        {/* Full-bleed Backdrop with Cinematic Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <CinematicBackdropArt movie={movie} className="h-full w-full object-cover scale-105" />
          {/* Multi-layered cinematic gradient scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 sm:pb-14 w-full">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start md:items-end">
            {/* Movie Poster (Desktop & Tablet) */}
            <div className="hidden md:block w-52 lg:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/15 bg-zinc-900 group">
              <MoviePosterArt movie={movie} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>

            {/* Movie Information Column */}
            <div className="flex-1 space-y-4 max-w-3xl">
              {/* Badge Row */}
              <div className="flex flex-wrap items-center gap-2">
                {movie.isOriginal && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e50914] text-white text-[11px] font-black uppercase tracking-wider shadow">
                    <Sparkles className="w-3 h-3" />
                    RBFLIX ORIGINAL
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-xs font-bold backdrop-blur-xs">
                  {movie.quality || '4K Ultra HD'}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-xs font-bold">
                  {movie.maturityRating || '16+'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {movie.title}
              </h1>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-300 font-medium">
                {/* Match Score */}
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  {movie.matchScore || 98}% Match
                </span>

                {/* Star / TMDB Rating */}
                <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>TMDB {enrichedData?.voteAverage ? enrichedData.voteAverage.toFixed(1) : movie.rating.toFixed(1)}</span>
                </span>

                {/* Release Year */}
                <span className="flex items-center gap-1 text-zinc-300">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{movie.year}</span>
                </span>

                {/* Duration */}
                <span className="flex items-center gap-1 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{enrichedData?.runtimeFormatted || movie.duration || '2h 15m'}</span>
                </span>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {movie.genres.map(genre => (
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
                {enrichedData?.overview || movie.description}
              </p>

              {/* Director info */}
              {(enrichedData?.director || movie.director) && (
                <p className="text-xs text-zinc-400 font-medium">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Director:</span>{' '}
                  <span className="text-zinc-300 font-semibold">{enrichedData?.director || movie.director}</span>
                </p>
              )}

              {/* Action Buttons: Play + Add to My List + Share */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {/* Main Play Button */}
                <button
                  onClick={() => navigate(`/watch/movie/${movie.id}`)}
                  className="flex items-center justify-center gap-2.5 px-7 py-3 bg-white text-black font-extrabold text-sm sm:text-base rounded-md hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-black/60 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={`Play ${movie.title}`}
                >
                  <Play className="w-5 h-5 fill-black transition-transform group-hover:scale-110" />
                  <span>Play</span>
                </button>

                {/* Add to My List Toggle */}
                <button
                  onClick={() => toggleMyList(movie.id)}
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

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-3 rounded-md bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-700/80 backdrop-blur-md active:scale-95 transition-colors cursor-pointer"
                  title="Share link"
                  aria-label="Share movie link"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CAST / ACTORS SECTION */}
      {castList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Top Cast & Characters</span>
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

      {/* 3. SIMILAR MOVIES SECTION */}
      {similarMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Film className="w-5 h-5 text-[#e50914]" />
              <span>Similar Movies</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Recommended based on this title</span>
          </div>

          <div className="overflow-x-auto scrollbar-none flex gap-4 pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {similarMovies.map(similar => (
              <div
                key={similar.id}
                onClick={() => navigate(`/movie/${similar.id}`)}
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
