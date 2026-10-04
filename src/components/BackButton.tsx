import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  className = '', 
  fallbackPath = '/' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if there is history in this session
    // React Router's index in history state can tell us if we can go back
    const canGoBack = window.history.state && window.history.state.idx > 0;

    if (canGoBack) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`group flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-800/50 hover:border-red-500/50 cursor-pointer backdrop-blur-md shadow-lg ${className}`}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 group-active:scale-90" />
      <span className="text-xs font-black uppercase tracking-widest hidden sm:inline pr-1">Back</span>
    </button>
  );
};
