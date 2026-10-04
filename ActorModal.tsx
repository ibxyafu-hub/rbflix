import React, { useEffect, useState } from 'react';
import { X, Film, Tv, Star, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { ContentItem, isSeries } from '../types/content';
import { MoviePosterArt } from './MovieArt';

interface ActorModalProps {
  actorName: string;
  onClose: () => void;
}

export const ActorModal: React.FC<ActorModalProps> = ({ actorName, onClose }) => {
  const navigate = useNavigate();
  const [details, setDetails] = useState<{
    name: string;
    profileUrl: string;
    character?: string;
    biography: string;
    knownFor: string;
    titles: ContentItem[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    tmdbService.getActorDetails(actorName).then(res => {
      if (isMounted) {
        setDetails(res);
        setIsLoading(false);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actorName, onClose]);

  const handleTitleClick = (item: ContentItem) => {
    onClose();
    if (isSeries(item)) {
      navigate(`/series/${item.id}`);
    } else {
      navigate(`/movie/${item.id}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`Actor profile for ${actorName}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#181818] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl my-8 text-white"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            aria-label="Close actor profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-[#e50914]/30 shadow-xl shrink-0 bg-zinc-900">
                <img
                  src={details?.profileUrl || ''}
                  alt={actorName}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
                  <span>Cast & Performer</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {actorName}
                </h3>
                {details?.character && (
                  <p className="text-sm font-medium text-[#e50914]">
                    Role: {details.character}
                  </p>
                )}
                {details?.knownFor && (
                  <p className="text-xs text-zinc-400 font-medium">
                    <span className="text-zinc-500 font-semibold uppercase tracking-wider">Known For:</span>{' '}
                    {details.knownFor}
                  </p>
                )}
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2 border-t border-zinc-800/80 pt-5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Biography
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {details?.biography || 'Loading actor information...'}
              </p>
            </div>

            {/* Titles on RBflix featuring this actor */}
            <div className="space-y-3 border-t border-zinc-800/80 pt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#e50914]" />
                  <span>Available on RBflix</span>
                </h4>
                <span className="text-xs text-zinc-500 font-medium">
                  {details?.titles.length || 0} title{details?.titles.length === 1 ? '' : 's'}
                </span>
              </div>

              {isLoading ? (
                <div className="h-24 flex items-center justify-center text-zinc-500 text-xs">
                  Searching catalog...
                </div>
              ) : details && details.titles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {details.titles.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleTitleClick(item)}
                      className="group/card flex items-center gap-3 p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer select-none"
                    >
                      <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-zinc-950">
                        <MoviePosterArt movie={item} showDetails={false} className="h-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white truncate group-hover/card:text-[#e50914] transition-colors">
                          {item.title}
                        </h5>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                          {item.year} · {isSeries(item) ? 'Series' : 'Movie'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  No other titles currently published for this actor.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
