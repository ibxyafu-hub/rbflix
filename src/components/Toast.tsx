import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-neutral-900/95 text-white border border-zinc-700/80 rounded-lg shadow-2xl backdrop-blur-md text-sm font-medium tracking-wide"
        >
          <CheckCircle2 className="w-4 h-4 text-[#e50914] shrink-0" />
          <span>{toast}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
