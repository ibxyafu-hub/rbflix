import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Film, 
  Tv, 
  FileText,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackButton } from '../components/BackButton';
import { contentService } from '../services/contentService';
import { subtitleService } from '../services/subtitleService';
import { ContentItem, isSeries, isMovie, Series, Episode, Season } from '../types/content';
import { useApp } from '../context/AppContext';

export const AdminSubtitlePage: React.FC = () => {
  const { showToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  
  const [isUploading, setIsLoadingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContent(allContent);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredContent(
      allContent.filter(item => item.title.toLowerCase().includes(q))
    );
  }, [searchQuery, allContent]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const data = await contentService.getAllContent();
      setAllContent(data);
      setFilteredContent(data);
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to load content library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectContent = (item: ContentItem) => {
    setSelectedContent(item);
    setSelectedSeason(null);
    setSelectedEpisode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContent) return;

    // Validate extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'vtt' && ext !== 'srt') {
      showToast('Please upload a .vtt or .srt file');
      return;
    }

    setIsLoadingUpload(true);
    setUploadProgress(20);

    try {
      const type = isMovie(selectedContent) ? 'movie' : 'episode';
      const id = type === 'movie' ? selectedContent.id : selectedEpisode?.id;
      
      if (!id) {
        showToast('Please select an episode first');
        return;
      }

      setUploadProgress(50);
      const result = await subtitleService.uploadAmharicSubtitle(id, file, type);
      setUploadProgress(100);

      if (result.success) {
        showToast(`Amharic subtitles uploaded successfully!`);
        // Refresh local state
        if (type === 'movie') {
          setSelectedContent({ ...selectedContent, amharicSubtitleUrl: result.url });
        } else if (selectedEpisode) {
          const updatedEp = { ...selectedEpisode, amharicSubtitleUrl: result.url };
          setSelectedEpisode(updatedEp);
          // Also update in season list
          if (selectedSeason) {
            setSelectedSeason({
              ...selectedSeason,
              episodes: selectedSeason.episodes.map(ep => ep.id === id ? updatedEp : ep)
            });
          }
        }
        fetchContent(); // Refresh background list
      } else {
        showToast(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      showToast('An unexpected error occurred during upload');
    } finally {
      setTimeout(() => {
        setIsLoadingUpload(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDeleteSubtitle = async () => {
    if (!selectedContent) return;
    
    if (!window.confirm('Are you sure you want to delete Amharic subtitles for this item?')) return;

    try {
      const type = isMovie(selectedContent) ? 'movie' : 'episode';
      const id = type === 'movie' ? selectedContent.id : selectedEpisode?.id;
      
      if (!id) return;

      const success = await subtitleService.deleteAmharicSubtitle(id, type);
      if (success) {
        showToast('Subtitles deleted');
        if (type === 'movie') {
          setSelectedContent({ ...selectedContent, amharicSubtitleUrl: undefined });
        } else if (selectedEpisode) {
          const updatedEp = { ...selectedEpisode, amharicSubtitleUrl: undefined };
          setSelectedEpisode(updatedEp);
          if (selectedSeason) {
            setSelectedSeason({
              ...selectedSeason,
              episodes: selectedSeason.episodes.map(ep => ep.id === id ? updatedEp : ep)
            });
          }
        }
        fetchContent();
      }
    } catch (err) {
      showToast('Failed to delete subtitles');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e50914] flex items-center justify-center shadow-lg shadow-red-900/20">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic">Subtitle Management</h1>
              <p className="text-zinc-500 text-sm font-medium">Manage Amharic (አማርኛ) subtitle tracks for movies and TV series</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Content List & Search */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#e50914] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies or series..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#e50914] transition-all"
              />
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden h-[600px] flex flex-col">
              <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Content Library</span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e50914]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Scanning Archive...</span>
                  </div>
                ) : filteredContent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 italic py-10">
                    <p className="text-xs">No matching titles found</p>
                  </div>
                ) : (
                  filteredContent.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectContent(item)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${
                        selectedContent?.id === item.id 
                          ? 'bg-[#e50914] text-white' 
                          : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.type === 'movie' ? <Film className="w-4 h-4 shrink-0" /> : <Tv className="w-4 h-4 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase tracking-tighter opacity-60">{item.year}</span>
                          {item.amharicSubtitleUrl && (
                            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-1 rounded">
                              <Check className="w-2 h-2" /> Subbed
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-3 h-3 transition-transform ${selectedContent?.id === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-40'}`} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Management Pane */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!selectedContent ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-zinc-900/10 border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center p-12 h-[680px] text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 opacity-40">
                    <FileText className="w-8 h-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-500 uppercase tracking-widest mb-2">Select a Title</h3>
                  <p className="text-zinc-600 text-sm max-w-xs leading-relaxed">
                    Choose a movie or TV series from the sidebar to manage its Amharic subtitle tracks.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key={selectedContent.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900/20 border border-zinc-800/60 rounded-[2rem] p-8 sm:p-10 space-y-8"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-zinc-800/80 pb-8">
                    <div className="w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 shrink-0">
                      <img 
                        src={selectedContent.posterUrl} 
                        alt={selectedContent.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedContent.type === 'movie' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                          {selectedContent.type}
                        </span>
                        <span className="text-zinc-500 text-sm font-bold">ID: {selectedContent.id}</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{selectedContent.title}</h2>
                      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-2 italic">{selectedContent.description}</p>
                    </div>
                  </div>

                  {/* IF SERIES: Season & Episode selection */}
                  {isSeries(selectedContent) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block ml-1">Season</label>
                        <select
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e50914] cursor-pointer"
                          onChange={(e) => {
                            const season = selectedContent.seasons.find(s => s.id === e.target.value);
                            setSelectedSeason(season || null);
                            setSelectedEpisode(null);
                          }}
                          value={selectedSeason?.id || ''}
                        >
                          <option value="">Select Season</option>
                          {selectedContent.seasons.map(s => (
                            <option key={s.id} value={s.id}>Season {s.seasonNumber}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block ml-1">Episode</label>
                        <select
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#e50914] cursor-pointer"
                          disabled={!selectedSeason}
                          onChange={(e) => {
                            const ep = selectedSeason?.episodes.find(ep => ep.id === e.target.value);
                            setSelectedEpisode(ep || null);
                          }}
                          value={selectedEpisode?.id || ''}
                        >
                          <option value="">Select Episode</option>
                          {selectedSeason?.episodes.map(ep => (
                            <option key={ep.id} value={ep.id}>
                              Ep {ep.episodeNumber}: {ep.title} {ep.amharicSubtitleUrl ? '✓' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Upload UI */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        Amharic Tracks
                        {((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                          (selectedEpisode && selectedEpisode.amharicSubtitleUrl)) && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </h3>
                    </div>

                    {(isMovie(selectedContent) || selectedEpisode) ? (
                      <div className="space-y-6">
                        {/* Status Card */}
                        <div className={`p-6 rounded-2xl border transition-all ${
                          ((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                          (selectedEpisode && selectedEpisode.amharicSubtitleUrl))
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-zinc-900/50 border-zinc-800'
                        }`}>
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                ((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                                (selectedEpisode && selectedEpisode.amharicSubtitleUrl))
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-zinc-800 text-zinc-500'
                              }`}>
                                {((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                                (selectedEpisode && selectedEpisode.amharicSubtitleUrl)) 
                                  ? <CheckCircle2 className="w-6 h-6" /> 
                                  : <AlertCircle className="w-6 h-6" />}
                              </div>
                              <div>
                                <p className="font-black text-sm uppercase tracking-widest">
                                  {((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                                  (selectedEpisode && selectedEpisode.amharicSubtitleUrl)) 
                                    ? 'Active Subtitles Found' 
                                    : 'Subtitles Missing'}
                                </p>
                                <p className="text-xs text-zinc-500 font-medium">
                                  {((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                                  (selectedEpisode && selectedEpisode.amharicSubtitleUrl)) 
                                    ? 'Amharic (አማርኛ) track is published and available' 
                                    : 'Please upload a .vtt or .srt file to enable Amharic option'}
                                </p>
                              </div>
                            </div>

                            {((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                             (selectedEpisode && selectedEpisode.amharicSubtitleUrl)) && (
                              <button 
                                onClick={handleDeleteSubtitle}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all text-xs font-black uppercase cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove Track
                              </button>
                            )}
                          </div>
                          
                          {/* Current URL Preview */}
                          {((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                           (selectedEpisode && selectedEpisode.amharicSubtitleUrl)) && (
                            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2">
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Direct Link:</span>
                              <a 
                                href={isMovie(selectedContent) ? selectedContent.amharicSubtitleUrl : selectedEpisode?.amharicSubtitleUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] text-emerald-400 hover:underline truncate max-w-sm font-mono"
                              >
                                {isMovie(selectedContent) ? selectedContent.amharicSubtitleUrl : selectedEpisode?.amharicSubtitleUrl}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Upload Zone */}
                        <div className="relative">
                          <input
                            type="file"
                            id="subtitle-upload"
                            accept=".vtt,.srt"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="subtitle-upload"
                            className={`flex flex-col items-center justify-center p-10 rounded-[2rem] border-2 border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-[#e50914] transition-all cursor-pointer group ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                          >
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-4">
                                <div className="relative w-16 h-16">
                                  <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="6" />
                                    <circle 
                                      cx="50" cy="50" r="45" 
                                      fill="none" stroke="#e50914" strokeWidth="6" 
                                      strokeDasharray={2 * Math.PI * 45}
                                      strokeDashoffset={2 * Math.PI * 45 * (1 - uploadProgress / 100)}
                                      strokeLinecap="round"
                                      className="transition-all duration-300"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-black">{Math.round(uploadProgress)}%</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Syncing to Cloud...</span>
                              </div>
                            ) : (
                              <>
                                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <Upload className="w-6 h-6 text-zinc-500 group-hover:text-[#e50914] transition-colors" />
                                </div>
                                <p className="font-black text-sm uppercase tracking-widest mb-1">
                                  {((isMovie(selectedContent) && selectedContent.amharicSubtitleUrl) || 
                                   (selectedEpisode && selectedEpisode.amharicSubtitleUrl)) 
                                    ? 'Replace Amharic Subtitles' 
                                    : 'Upload Amharic Subtitles'}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Recommended format: WebVTT (.vtt)</p>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-zinc-900/10 border border-zinc-800/40 rounded-[2rem] opacity-50">
                        <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest italic">
                          Please select a season and episode to continue
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
