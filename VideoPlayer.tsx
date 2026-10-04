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
} from 'lucide-react';
import { motion } from 'framer-motion';
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
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movie,
  content: propContent,
  episode,
  season,
  initialTime = 0,
  onClose,
  onNextEpisode,
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

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(140);
  const [bufferedTime, setBufferedTime] = useState(110);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  // Advanced menus for HTML5 player
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [subtitle, setSubtitle] = useState<'Off' | 'English [CC]' | 'Spanish'>('English [CC]');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  const [seekHoverTime, setSeekHoverTime] = useState<number | null>(null);
  const [seekHoverX, setSeekHoverX] = useState<number>(0);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Prevent background page from scrolling while player modal is active
  useEffect(() => {
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
  }, []);

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
    if (isNaN(timeInSeconds)) return '00:00';
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
      setShowControls(false);
      setShowSpeedMenu(false);
      setShowSubtitleMenu(false);
    }, 3500);
  }, []);

  // Handle Play/Pause for HTML5 video
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  }, [resetHideTimer]);

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
      video.playbackRate = playbackSpeed;
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    };

    const onWaiting = () => setIsLoadingMedia(true);
    const onPlaying = () => setIsLoadingMedia(false);
    const onError = () => {
      setIsLoadingMedia(false);
      setHasVideoError(true);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
    };
  }, [activeContent, episode, saveProgress, volume, playbackSpeed, initialTime, normalizedEmbedUrl]);

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
    : `${(activeContent as Movie).duration || '2h'} · ${activeContent.maturityRating || '16+'}`;

  const hasSource = Boolean(normalizedEmbedUrl || directVideoUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-black/95 backdrop-blur-md select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Video player for ${mainTitleText}`}
    >
      {/* Centered Responsive Player Container with Framer Motion Scale/Fade Entrance */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetHideTimer}
        className="relative w-full max-w-6xl aspect-video max-h-[88vh] bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10 flex items-center justify-center"
      >
        {/* Top hover trigger strip to reveal top controls */}
        <div
          className="absolute top-0 left-0 right-0 h-16 z-30 pointer-events-auto"
          onMouseEnter={() => setShowControls(true)}
          onMouseMove={resetHideTimer}
        />

        {/* 1. UNAVAILABLE STATE (No embed or video source in database) */}
        {!hasSource ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#e50914]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Video Stream Unavailable</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This title does not have an active embed or video stream configured in the Supabase database.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm rounded-md transition-colors cursor-pointer"
              >
                Back to Browse
              </button>
            </div>
          </div>
        ) : normalizedEmbedUrl ? (
          /* 2. EMBEDDED VIDEO PLAYER (Responsive iframe without sandbox restrictions) */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <iframe
              src={normalizedEmbedUrl}
              title={mainTitleText}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="eager"
            />
          </div>
        ) : (
          /* 3. HTML5 VIDEO PLAYER (For direct MP4 / WebM video files) */
          <>
            <video
              ref={videoRef}
              src={directVideoUrl}
              playsInline
              autoPlay
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Loading Spinner */}
            {isLoadingMedia && !hasVideoError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-xs">
                <Loader2 className="w-12 h-12 text-[#e50914] animate-spin" />
              </div>
            )}

            {/* Error fallback */}
            {hasVideoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center z-30">
                <AlertCircle className="w-12 h-12 text-[#e50914] mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Stream Error</h3>
                <p className="text-sm text-zinc-400 max-w-md mb-4">
                  Unable to load stream for {mainTitleText}.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-zinc-800 text-white rounded text-sm font-semibold hover:bg-zinc-700 cursor-pointer"
                >
                  Back to Browse
                </button>
              </div>
            )}

            {/* Subtitles Overlay */}
            {subtitle !== 'Off' && (
              <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 z-30 pointer-events-none flex justify-center px-4">
                <div className="bg-black/75 px-4 py-1.5 rounded text-white text-xs sm:text-sm md:text-base font-medium tracking-wide drop-shadow-md border border-white/10 max-w-2xl text-center">
                  {subtitle === 'Spanish' ? (
                    <span>[Música cinematográfica y diálogos en alta fidelidad]</span>
                  ) : (
                    <span>[Dramatic orchestral score playing - Dolby Atmos]</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* TOP OVERLAY HEADER BAR */}
        {hasSource && (
          <div
            className={`absolute top-0 left-0 right-0 z-40 p-3 sm:p-5 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 pointer-events-none ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-between pr-14">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate drop-shadow-md">
                    {mainTitleText}
                  </h2>
                  {activeContent.isOriginal && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#e50914] text-[10px] font-extrabold uppercase tracking-widest text-white shadow">
                      Original
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-300 font-medium drop-shadow">
                  {subTitleText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CLOSE BUTTON (Top-Right of Player Container) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-black/90 active:bg-black text-white/90 hover:text-white backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
          aria-label="Close player"
          title="Close player (Esc)"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>

        {/* BOTTOM CONTROLS BAR (For HTML5 direct video playback only) */}
        {!normalizedEmbedUrl && hasSource && (
          <div
            className={`absolute bottom-0 left-0 right-0 z-40 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-full space-y-2.5">
              {/* Seek Bar */}
              <div
                className="relative h-2 group/seek cursor-pointer flex items-center py-2"
                onClick={handleSeek}
                onMouseMove={handleSeekMouseMove}
                onMouseLeave={() => setSeekHoverTime(null)}
              >
                {/* Background Track */}
                <div className="w-full h-1.5 bg-zinc-700/70 group-hover/seek:h-2 rounded-full overflow-hidden transition-all relative">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-zinc-500/60 transition-all duration-200"
                    style={{ width: `${bufferedPercent}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-[#e50914] rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Scrubber Knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-[#e50914] border-2 border-white rounded-full shadow-md transition-transform scale-0 group-hover/seek:scale-100 pointer-events-none"
                  style={{ left: `${progressPercent}%` }}
                />

                {/* Hover Time Tooltip */}
                {seekHoverTime !== null && (
                  <div
                    className="absolute bottom-6 -translate-x-1/2 bg-black/90 text-white text-xs font-mono px-2 py-1 rounded shadow border border-zinc-700 pointer-events-none"
                    style={{ left: `${seekHoverX}px` }}
                  >
                    {formatTime(seekHoverTime)}
                  </div>
                )}
              </div>

              {/* Bottom Buttons Row */}
              <div className="flex items-center justify-between gap-3">
                {/* Left Controls */}
                <div className="flex items-center gap-2.5 sm:gap-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-zinc-300 transition-transform active:scale-95 cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSkip(-10)}
                    className="text-white hover:text-zinc-300 transition-colors p-1 cursor-pointer"
                    title="Skip back 10s"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={() => handleSkip(10)}
                    className="text-white hover:text-zinc-300 transition-colors p-1 cursor-pointer"
                    title="Skip forward 10s"
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 sm:w-20 h-1 bg-zinc-600 accent-[#e50914] rounded-lg cursor-pointer transition-all"
                    />
                  </div>

                  {/* Time Display */}
                  <div className="text-xs font-mono text-zinc-300 select-none hidden sm:block">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-zinc-500 mx-1">/</span>
                    <span className="text-zinc-400">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3 relative">
                  {/* Next Episode Button */}
                  {isSeriesContent && nextEpisode && nextSeason && onNextEpisode && (
                    <button
                      onClick={() => onNextEpisode(nextEpisode!, nextSeason!)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Next Episode</span>
                    </button>
                  )}

                  {/* Subtitles Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSubtitleMenu(prev => !prev);
                        setShowSpeedMenu(false);
                      }}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        subtitle !== 'Off' ? 'text-[#e50914]' : 'text-white hover:text-zinc-300'
                      }`}
                      title="Subtitles / Audio"
                    >
                      <Subtitles className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {showSubtitleMenu && (
                      <div className="absolute right-0 bottom-10 w-40 bg-zinc-900/95 border border-zinc-700/80 rounded-lg p-2 shadow-2xl backdrop-blur-md z-50 text-xs space-y-1">
                        <div className="text-zinc-400 font-bold px-2 py-1 border-b border-zinc-800">
                          Subtitles
                        </div>
                        {(['Off', 'English [CC]', 'Spanish'] as const).map(opt => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSubtitle(opt);
                              setShowSubtitleMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800 text-left transition-colors cursor-pointer ${
                              subtitle === opt ? 'text-[#e50914] font-bold' : 'text-zinc-200'
                            }`}
                          >
                            <span>{opt}</span>
                            {subtitle === opt && <Check className="w-3 h-3 text-[#e50914]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Speed Settings Menu */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSpeedMenu(prev => !prev);
                        setShowSubtitleMenu(false);
                      }}
                      className="p-1 text-white hover:text-zinc-300 transition-colors cursor-pointer"
                      title="Playback Speed"
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute right-0 bottom-10 w-36 bg-zinc-900/95 border border-zinc-700/80 rounded-lg p-2 shadow-2xl backdrop-blur-md z-50 text-xs space-y-1">
                        <div className="text-zinc-400 font-bold px-2 py-1 border-b border-zinc-800">
                          Playback Speed
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => changeSpeed(speed)}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800 text-left transition-colors cursor-pointer ${
                              playbackSpeed === speed ? 'text-[#e50914] font-bold' : 'text-zinc-200'
                            }`}
                          >
                            <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                            {playbackSpeed === speed && <Check className="w-3 h-3 text-[#e50914]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-zinc-300 transition-transform active:scale-95 p-1 cursor-pointer"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
