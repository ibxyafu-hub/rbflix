import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  Check,
  AlertCircle,
  SkipForward,
  Loader2,
  X,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentItem, Movie, Series, Episode, Season, isSeries } from '../types/content';
import { useApp } from '../context/AppContext';
import { normalizeEmbedUrl, isDirectVideoUrl, isEmbedUrl } from '../utils/embedUtils';

interface VideoPlayerProps {
  movie?: ContentItem;
  content?: ContentItem;
  episode?: Episode;
  season?: Season;
  initialTime?: number;
  onClose: () => void;
  onNextEpisode?: (nextEpisode: Episode, season: Season) => void;
  inline?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  content: propContent,
  episode,
  season,
  initialTime = 0,
  onClose,
  onNextEpisode,
  inline = false,
}) => {
  const { saveProgress } = useApp();

  const activeContent = propContent || movie;
  if (!activeContent) return null;

  const isSeriesContent = isSeries(activeContent);
  const series = isSeriesContent ? (activeContent as Series) : null;

  // Retrieve raw URLs from movie or episode
  const rawVideoUrl = episode?.videoUrl || (activeContent as Movie).videoUrl;
  const rawEmbedUrl = episode?.embedUrl || (activeContent as Movie).embedUrl;

  // Identify whether we have an embed URL or a direct video file URL
  const candidateEmbed = rawEmbedUrl || (rawVideoUrl && isEmbedUrl(rawVideoUrl) ? rawVideoUrl : undefined);
  const normalizedEmbedUrl = candidateEmbed ? normalizeEmbedUrl(candidateEmbed) : undefined;
  const directVideoUrl = !normalizedEmbedUrl && rawVideoUrl && isDirectVideoUrl(rawVideoUrl) ? rawVideoUrl : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimerRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(true); // Default to muted for reliable autoplay
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  // Advanced menus for HTML5 player
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // Real Subtitle support
  const amharicTrackUrl = episode?.amharicSubtitleUrl || (activeContent as Movie).amharicSubtitleUrl;
  
  type SubtitleLang = 'Off' | 'English [CC]' | 'Spanish' | 'Amharic (አማርኛ)';
  const [subtitle, setSubtitle] = useState<SubtitleLang>('Off');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [quality, setQuality] = useState<'Auto' | '1080p' | '720p' | '480p'>('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const [seekHoverTime, setSeekHoverTime] = useState<number | null>(null);
  const [seekHoverX, setSeekHoverX] = useState<number>(0);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Immediately set loading to false for iframes as we can't track their internal state easily
  useEffect(() => {
    if (normalizedEmbedUrl) {
      setIsLoadingMedia(false);
    }
  }, [normalizedEmbedUrl]);

  // Sync HTML5 TextTracks with UI state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;

    for (let i = 0; i < video.textTracks.length; i++) {
      const track = video.textTracks[i];
      if (subtitle === 'Off') {
        track.mode = 'disabled';
      } else if (track.label === subtitle) {
        track.mode = 'showing';
      } else {
        track.mode = 'hidden';
      }
    }
  }, [subtitle]);

  // Prevent background page from scrolling while player modal is active
  useEffect(() => {
    if (inline) return;
    
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [inline]);

  // Next episode calculation for series
  let nextEpisode: Episode | undefined;
  let nextSeason: Season | undefined;

  if (isSeriesContent && series && episode && season) {
    const currentEpisodeIndex = season.episodes.findIndex(ep => ep.id === episode.id);
    if (currentEpisodeIndex >= 0 && currentEpisodeIndex < season.episodes.length - 1) {
      nextEpisode = season.episodes[currentEpisodeIndex + 1];
      nextSeason = season;
    } else {
      const currentSeasonIndex = series.seasons.findIndex(s => s.id === season.id);
      if (currentSeasonIndex >= 0 && currentSeasonIndex < series.seasons.length - 1) {
        const followingSeason = series.seasons[currentSeasonIndex + 1];
        if (followingSeason.episodes.length > 0) {
          nextEpisode = followingSeason.episodes[0];
          nextSeason = followingSeason;
        }
      }
    }
  }

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Reset auto-hide timer for header & controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowSubtitleMenu(false);
        setShowQualityMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Handle Play/Pause for HTML5 video
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      // If we were muted for autoplay, let's unmute on user interaction if volume > 0
      if (isMuted && volume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
      
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch((err) => {
        console.warn('Playback failed:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  }, [resetHideTimer, isMuted, volume]);

  // Seek ±10s for HTML5 video
  const handleSkip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 100, videoRef.current.currentTime + seconds)
    );
    resetHideTimer();
  }, [resetHideTimer]);

  // Toggle Mute for HTML5 video
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
    resetHideTimer();
  }, [isMuted, resetHideTimer]);

  // Toggle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    resetHideTimer();
  }, [resetHideTimer]);

  // Volume Change for HTML5 video
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
    resetHideTimer();
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const target = pos * (videoRef.current.duration || duration);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    resetHideTimer();
  };

  // Seek hover calculation
  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const hoverSeconds = pos * (duration || 100);
    setSeekHoverTime(hoverSeconds);
    setSeekHoverX(e.clientX - rect.left);
  };

  // Keyboard shortcuts (Escape closes, Space/Arrows for HTML5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      resetHideTimer();

      switch (e.key) {
        case ' ':
          if (!normalizedEmbedUrl) {
            e.preventDefault();
            togglePlay();
          }
          break;
        case 'ArrowLeft':
          if (!normalizedEmbedUrl) {
            e.preventDefault();
            handleSkip(-10);
          }
          break;
        case 'ArrowRight':
          if (!normalizedEmbedUrl) {
            e.preventDefault();
            handleSkip(10);
          }
          break;
        case 'ArrowUp':
          if (!normalizedEmbedUrl) {
            e.preventDefault();
            setVolume(prev => Math.min(1, prev + 0.1));
          }
          break;
        case 'ArrowDown':
          if (!normalizedEmbedUrl) {
            e.preventDefault();
            setVolume(prev => Math.max(0, prev - 0.1));
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          if (!normalizedEmbedUrl) {
            e.preventDefault();
            toggleMute();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSkip, toggleFullscreen, toggleMute, onClose, resetHideTimer, normalizedEmbedUrl]);

  // HTML5 Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || normalizedEmbedUrl) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setDuration(video.duration);
        saveProgress(activeContent, video.currentTime, video.duration, episode);
      }
      if (video.buffered.length > 0) {
        setBufferedTime(video.buffered.end(video.buffered.length - 1));
      }
    };

    const onLoadedMetadata = () => {
      setIsLoadingMedia(false);
      setDuration(video.duration);
      video.volume = volume;
      video.muted = isMuted;
      video.playbackRate = playbackSpeed;
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      
      // Auto-play attempt
      video.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(() => {
        // Autoplay might be blocked, showing play button is handled by state
        setIsPlaying(false);
        setHasStarted(false);
      });
    };

    const onCanPlay = () => setIsLoadingMedia(false);
    const onWaiting = () => setIsLoadingMedia(true);
    const onPlaying = () => {
      setIsLoadingMedia(false);
      setIsPlaying(true);
      setHasStarted(true);
    };
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsLoadingMedia(false);
      setHasVideoError(true);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onError);
    };
  }, [activeContent, episode, saveProgress, volume, isMuted, playbackSpeed, initialTime, normalizedEmbedUrl]);

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    resetHideTimer();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedTime / duration) * 100 : 0;

  // Title header text
  const mainTitleText = isSeriesContent && episode
    ? `${activeContent.title}: Season ${episode.seasonNumber}, Ep ${episode.episodeNumber}`
    : activeContent.title;

  const subTitleText = isSeriesContent && episode
    ? `"${episode.title}" · ${episode.duration}`
    : (activeContent as Movie).duration || '2h';

  const hasSource = Boolean(normalizedEmbedUrl || directVideoUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={inline ? "w-full h-full relative group bg-black" : "fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden"}
      role="dialog"
      aria-modal={!inline}
    >
      <div
        ref={containerRef}
        onMouseMove={resetHideTimer}
        onClick={resetHideTimer}
        className={inline ? "w-full h-full relative flex items-center justify-center overflow-hidden" : "relative w-full h-full flex items-center justify-center overflow-hidden"}
      >
        {/* VIDEO CONTENT */}
        {!hasSource ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-[#e50914] shadow-2xl">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Stream Unavailable</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                This title does not have an active video stream.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-full border border-zinc-800 transition-all cursor-pointer"
            >
              Back to Browse
            </button>
          </div>
        ) : normalizedEmbedUrl ? (
          <iframe
            src={normalizedEmbedUrl}
            title={mainTitleText}
            className="w-full h-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={directVideoUrl}
              playsInline
              autoPlay
              muted={isMuted}
              className="w-full h-full object-contain cursor-pointer bg-black"
              onClick={togglePlay}
              crossOrigin="anonymous"
            >
              {amharicTrackUrl && (
                <track 
                  kind="subtitles" 
                  src={amharicTrackUrl} 
                  srcLang="am" 
                  label="Amharic (አማርኛ)" 
                  default={subtitle === 'Amharic (አማርኛ)'}
                />
              )}
            </video>

            {/* Centered Play Button before playback starts */}
            <AnimatePresence>
              {!hasStarted && !isLoadingMedia && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="w-24 h-24 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#e50914] hover:border-[#e50914] hover:scale-110 transition-all pointer-events-auto shadow-2xl group"
                  >
                    <Play className="w-10 h-10 fill-current translate-x-1 transition-transform group-hover:scale-110" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Smooth Loading Spinner */}
        <AnimatePresence>
          {isLoadingMedia && !hasVideoError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-[2px] pointer-events-none"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-16 h-16 text-[#e50914] animate-spin" />
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">Loading Stream</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Fallback */}
        {hasVideoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-50 p-6 text-center">
            <AlertCircle className="w-16 h-16 text-[#e50914] mb-6" />
            <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Playback Error</h3>
            <p className="text-sm text-zinc-500 max-w-md mb-8 font-medium">
              We encountered an issue loading this video stream. The source might be blocked or temporarily unavailable.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#e50914] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all cursor-pointer shadow-xl shadow-red-900/20"
            >
              Return to Browse
            </button>
          </div>
        )}

        {/* TOP OVERLAY (Consistent for both iframe and HTML5) */}
        {hasSource && !inline && (
          <div
            className={`absolute top-0 left-0 right-0 z-40 p-6 sm:p-10 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-500 ease-out ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-6">
              <button
                onClick={onClose}
                className="p-3 -m-3 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
                aria-label="Go back"
              >
                <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
              
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate drop-shadow-2xl italic uppercase">
                    {mainTitleText}
                  </h2>
                  {activeContent.isOriginal && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#e50914] text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                      Original
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-black uppercase tracking-widest mt-1 drop-shadow-lg">
                  {subTitleText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM CONTROLS (Only for HTML5) */}
        {!normalizedEmbedUrl && hasSource && (
          <div
            className={`absolute bottom-0 left-0 right-0 z-40 p-6 sm:p-10 bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-all duration-500 ease-out ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            <div className="w-full max-w-screen-xl mx-auto space-y-6">
              {/* Modern Seek Bar with Draggable Handle */}
              <div className="space-y-4">
                <div
                  className="relative h-2.5 group/seek cursor-pointer flex items-center py-2"
                  onClick={handleSeek}
                  onMouseMove={handleSeekMouseMove}
                  onMouseLeave={() => setSeekHoverTime(null)}
                >
                  {/* Background Track */}
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden transition-all relative group-hover/seek:h-2">
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-white/10 transition-all duration-200"
                      style={{ width: `${bufferedPercent}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#e50914]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Red Draggable Seek Handle */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-[#e50914] border-2 border-white rounded-full shadow-[0_0_15px_rgba(229,9,20,0.6)] transition-all scale-0 group-hover/seek:scale-100 group-active/seek:scale-125 pointer-events-none z-10"
                    style={{ left: `${progressPercent}%` }}
                  />

                  {/* Hover Time Tooltip */}
                  <AnimatePresence>
                    {seekHoverTime !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-8 -translate-x-1/2 bg-black/90 backdrop-blur-xl text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-2xl border border-white/10 pointer-events-none tracking-widest"
                        style={{ left: `${seekHoverX}px` }}
                      >
                        {formatTime(seekHoverTime)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between gap-4">
                  {/* Left Group */}
                  <div className="flex items-center gap-4 sm:gap-8">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-[#e50914] transition-all active:scale-90 cursor-pointer focus:outline-none"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
                        ) : (
                          <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSkip(-10)}
                        className="text-white hover:text-zinc-300 transition-all p-1 cursor-pointer active:rotate-[-45deg]"
                        title="Back 10s"
                      >
                        <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" />
                      </button>

                      <button
                        onClick={() => handleSkip(10)}
                        className="text-white hover:text-zinc-300 transition-all p-1 cursor-pointer active:rotate-[45deg]"
                        title="Forward 10s"
                      >
                        <RotateCw className="w-6 h-6 sm:w-7 sm:h-7" />
                      </button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3 group/vol">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-6 h-6" />
                        ) : volume < 0.5 ? (
                          <Volume1 className="w-6 h-6" />
                        ) : (
                          <Volume2 className="w-6 h-6" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 sm:w-28 h-1.5 bg-white/20 accent-[#e50914] rounded-full cursor-pointer transition-all hover:h-2"
                      />
                    </div>

                    {/* Time Counter */}
                    <div className="text-[11px] sm:text-sm font-black text-zinc-300 select-none tracking-widest uppercase">
                      <span className="text-white">{formatTime(currentTime)}</span>
                      <span className="text-zinc-600 mx-2">/</span>
                      <span className="text-zinc-500">{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Right Group */}
                  <div className="flex items-center gap-2 sm:gap-6">
                    {/* Next Episode */}
                    {isSeriesContent && nextEpisode && nextSeason && onNextEpisode && (
                      <button
                        onClick={() => onNextEpisode(nextEpisode!, nextSeason!)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white text-black hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95"
                      >
                        <SkipForward className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">Next Episode</span>
                      </button>
                    )}

                    {/* Subtitles */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowSubtitleMenu(prev => !prev);
                          setShowSpeedMenu(false);
                          setShowQualityMenu(false);
                        }}
                        className={`p-2 rounded-full transition-all cursor-pointer hover:bg-white/10 ${
                          subtitle !== 'Off' ? 'text-[#e50914]' : 'text-white'
                        }`}
                        title="Subtitles"
                      >
                        <Subtitles className="w-6 h-6 sm:w-7 sm:h-7" />
                      </button>
                      <AnimatePresence>
                        {showSubtitleMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute right-0 bottom-14 w-56 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                          >
                            <div className="text-zinc-500 font-black uppercase tracking-widest text-[9px] px-4 py-3 border-b border-white/5 mb-1">
                              Subtitles & Audio
                            </div>
                            {(['Off', 'English [CC]', 'Spanish', 'Amharic (አማርኛ)'] as const).map(opt => {
                              if (opt === 'Amharic (አማርኛ)' && !amharicTrackUrl) return null;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => { setSubtitle(opt); setShowSubtitleMenu(false); }}
                                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 text-left transition-all cursor-pointer ${
                                    subtitle === opt ? 'text-[#e50914] font-black bg-white/5' : 'text-zinc-400 font-bold text-xs'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {subtitle === opt && <Check className="w-4 h-4" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quality */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowQualityMenu(prev => !prev);
                          setShowSubtitleMenu(false);
                          setShowSpeedMenu(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest ${
                          quality !== 'Auto' ? 'text-[#e50914] border-[#e50914]' : 'text-white border-white/20 hover:border-white'
                        }`}
                      >
                        {quality === 'Auto' ? '4K' : quality}
                      </button>
                      <AnimatePresence>
                        {showQualityMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute right-0 bottom-14 w-44 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                          >
                            <div className="text-zinc-500 font-black uppercase tracking-widest text-[9px] px-4 py-3 border-b border-white/5 mb-1">
                              Stream Quality
                            </div>
                            {(['Auto', '1080p', '720p', '480p'] as const).map(q => (
                              <button
                                key={q}
                                onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 text-left transition-all cursor-pointer ${
                                  quality === q ? 'text-[#e50914] font-black bg-white/5' : 'text-zinc-400 font-bold text-xs'
                                }`}
                              >
                                <span>{q}</span>
                                {quality === q && <Check className="w-4 h-4" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Speed */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowSpeedMenu(prev => !prev);
                          setShowSubtitleMenu(false);
                          setShowQualityMenu(false);
                        }}
                        className="p-2 rounded-full text-white hover:text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
                        title="Speed"
                      >
                        <Settings className="w-6 h-6 sm:w-7 sm:h-7" />
                      </button>
                      <AnimatePresence>
                        {showSpeedMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute right-0 bottom-14 w-44 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                          >
                            <div className="text-zinc-500 font-black uppercase tracking-widest text-[9px] px-4 py-3 border-b border-white/5 mb-1">
                              Playback Speed
                            </div>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                              <button
                                key={speed}
                                onClick={() => changeSpeed(speed)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/10 text-left transition-all cursor-pointer ${
                                  playbackSpeed === speed ? 'text-[#e50914] font-black bg-white/5' : 'text-zinc-400 font-bold text-xs'
                                }`}
                              >
                                <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                {playbackSpeed === speed && <Check className="w-4 h-4" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 rounded-full text-white hover:text-[#e50914] hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
                      aria-label={isFullscreen ? 'Minimize' : 'Maximize'}
                    >
                      {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
