import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed bottom-8 left-1/2 z-50 flex items-center gap-2.5 px-6 py-3 bg-white text-black rounded-full shadow-2xl text-sm font-bold tracking-wide"
        >
          <CheckCircle2 className="w-4 h-4 text-[#e50914] shrink-0" />
          <span>{toast}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
