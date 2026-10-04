import React from 'react';
import { Globe, Github, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-zinc-800/80 bg-[#111111] text-[#b3b3b3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Social Icons */}
        <div className="flex items-center gap-6 text-zinc-300">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="w-5 h-5" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs text-[#b3b3b3]">
          <div className="space-y-3">
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Audio Description</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Investor Relations</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Legal Notices</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Help Center</p>
          </div>

          <div className="space-y-3">
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Gift Cards</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Terms of Use</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Corporate Information</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Contact Us</p>
          </div>

          <div className="space-y-3">
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Media Center</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Privacy Policy</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Cookie Preferences</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Jobs</p>
          </div>

          <div className="space-y-3">
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Audio & Subtitles</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Impressum</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Speed Test</p>
            <p className="hover:underline cursor-pointer hover:text-zinc-200">Ad Choices</p>
          </div>
        </div>

        {/* Language selector button */}
        <div className="pt-2">
          <button
            onClick={() => alert('English (US) currently active')}
            className="flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-xs px-3 py-1.5 rounded text-zinc-300 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>English</span>
          </button>
        </div>

        {/* Brand Copyright */}
        <div className="text-[11px] text-zinc-500 pt-2 space-y-1">
          <p>© {new Date().getFullYear()} RBflix, Inc. All rights reserved.</p>
          <p className="text-[10px] text-zinc-600">
            RBflix is an independent cinematic streaming interface built with React and Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
};
