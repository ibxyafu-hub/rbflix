import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Instagram, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-zinc-800/80 bg-[#111111] text-[#b3b3b3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Social Icons */}
        <div className="flex items-center gap-6 text-zinc-300">
          <a
            href="https://www.instagram.com/apex.creativesaio?stkn=MXF1NHM2NTN3aGltOA=="
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://t.me/apex_creativesaio"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
            aria-label="Telegram"
          >
            <Send className="w-5 h-5" />
          </a>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-12 text-xs text-[#b3b3b3] max-w-lg">
          <div className="space-y-3">
            <a 
              href="https://t.me/Raf_babi" 
              target="_blank" 
              rel="noreferrer" 
              className="block hover:underline hover:text-zinc-200"
            >
              Help Center
            </a>
            <a 
              href="https://t.me/apexcreativesaio" 
              target="_blank" 
              rel="noreferrer" 
              className="block hover:underline hover:text-zinc-200"
            >
              Corporate Information
            </a>
          </div>

          <div className="space-y-3">
            <Link to="/privacy-policy" className="block hover:underline hover:text-zinc-200">Privacy Policy</Link>
            <Link to="/terms-of-use" className="block hover:underline hover:text-zinc-200">Terms of Use</Link>
          </div>
        </div>

        {/* Brand Copyright */}
        <div className="text-[11px] text-zinc-500 pt-2 space-y-1">
          <p>© {new Date().getFullYear()} RBflix, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
