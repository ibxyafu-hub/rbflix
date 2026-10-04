import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X, User, Settings, LogOut, Check, Heart, Film } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BackButton } from './BackButton';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    logout,
    setIsAuthModalOpen,
    searchQuery,
    setSearchQuery,
    myList,
  } = useApp();

  // Determine if we should show a back button in the global navbar
  const isDetailPage = location.pathname.includes('/movie/') || 
                       location.pathname.includes('/series/') || 
                       location.pathname.includes('/admin/');
  
  // Don't show back on top-level category pages
  const isTopLevel = location.pathname === '/' || 
                     location.pathname === '/movies' || 
                     location.pathname === '/series' || 
                     location.pathname === '/my-list' || 
                     location.pathname === '/search';
  
  const showBack = isDetailPage && !isTopLevel;
  const fallbackPath = location.pathname.includes('/movie/') ? '/movies' : 
                       location.pathname.includes('/series/') ? '/series' : '/';

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Monitor scroll for header background and hiding/revealing navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      // Header background
      setIsScrolled(currentScrollY > 40);

      // Hide/reveal logic
      if (currentScrollY > 220) {
        if (scrollDelta > 6) {
          setIsVisible(false); // scrolling down
        } else if (scrollDelta < -6) {
          setIsVisible(true); // scrolling up
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Auto focus when search expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'series', label: 'Series' },
    { id: 'mylist', label: 'My List', count: myList.length },
  ];

  const handleSearchToggle = () => {
    if (isSearchExpanded) {
      if (!searchQuery) {
        setIsSearchExpanded(false);
      }
    } else {
      setIsSearchExpanded(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 0 && currentTab !== 'search') {
      onTabChange('search');
    } else if (value.trim().length === 0 && currentTab === 'search') {
      onTabChange('home');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
    if (currentTab === 'search') {
      onTabChange('home');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 transform ease-[var(--ease)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-[#0b0b10]/78 backdrop-blur-[14px] shadow-lg shadow-black/60 border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-4 md:gap-8">
          {showBack && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <BackButton fallbackPath={fallbackPath} className="!bg-transparent !border-zinc-700/50" />
            </div>
          )}
          
          <button
            onClick={() => {
              clearSearch();
              onTabChange('home');
            }}
            style={{ 
              transition: 'opacity 0.5s var(--ease), transform 0.5s var(--ease)',
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0)' : 'translateY(20px)'
            }}
            className="text-2xl sm:text-3xl font-black tracking-tighter text-[#e50914] select-none hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded flex items-center"
            aria-label="RBflix Home"
          >
            RBFLIX
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium">
            {navLinks.map((link, i) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (currentTab === 'search') setSearchQuery('');
                    onTabChange(link.id);
                  }}
                  style={{ 
                    transition: 'opacity 0.5s var(--ease), transform 0.5s var(--ease)',
                    transitionDelay: isMounted ? `${(i + 1) * 50}ms` : '0ms',
                    opacity: isMounted ? 1 : 0,
                    transform: isMounted ? 'translateY(0)' : 'translateY(20px)'
                  }}
                  className={`nav-link transition-colors whitespace-nowrap relative py-1 focus-visible:outline-none focus-visible:text-white group ${
                    isActive
                      ? 'text-white font-semibold active'
                      : 'text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                      {link.count}
                    </span>
                  )}
                  {/* Red underline growing with scaleX */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#e50914] rounded-full transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Zone: Search, Profile Dropdown, Mobile Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Expandable Search Bar */}
          <div className="relative flex items-center">
            <div
              style={{
                transition: 'width 0.4s var(--ease), background-color 0.4s var(--ease)',
                transformOrigin: 'right'
              }}
              className={`flex items-center rounded-full overflow-hidden ${
                isSearchExpanded
                  ? 'w-48 sm:w-64 md:w-72 bg-black/80 border border-zinc-700 px-3 py-1.5 shadow-inner'
                  : 'w-9 h-9 justify-center bg-transparent'
              }`}
            >
              <button
                type="button"
                onClick={handleSearchToggle}
                className="text-zinc-300 hover:text-white transition-colors focus-visible:outline-none"
                aria-label="Toggle search input"
              >
                <Search className="w-5 h-5 shrink-0" />
              </button>

              <div className={`flex items-center flex-1 ml-2 transition-opacity duration-300 ${isSearchExpanded ? 'opacity-100' : 'opacity-0'}`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Titles, people, genres..."
                  className="w-full bg-transparent text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none"
                  disabled={!isSearchExpanded}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="text-zinc-400 hover:text-white text-xs p-1 ml-1"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Category Indicator for Search */}
          {currentTab === 'search' && (
            <button
              onClick={() => {
                clearSearch();
                onTabChange('home');
              }}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/80 border border-zinc-700/50 hidden sm:block"
            >
              Exit Search
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 p-1 rounded hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
              aria-label="User menu"
              aria-expanded={isProfileDropdownOpen}
            >
              <div className="w-8 h-8 rounded bg-[#e50914] flex items-center justify-center text-white font-bold text-sm shadow">
                {user.isLoggedIn ? user.name.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-zinc-300 max-w-[90px] truncate">
                {user.isLoggedIn ? user.name : 'Sign In'}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1f1f1f] border border-zinc-700/80 rounded-lg shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {user.isLoggedIn ? (
                  <>
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <p className="text-xs text-zinc-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onTabChange('mylist');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left"
                    >
                      <Film className="w-4 h-4 text-[#e50914]" />
                      <span>My List ({myList.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/admin/subtitles');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-emerald-500" />
                      <span>Subtitle Admin</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        alert(`Account: ${user.name}\nEmail: ${user.email}\nSubscription: RBflix Premium 4K HDR (Active)`);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      <span>Account Settings</span>
                    </button>

                    <div className="my-1 border-t border-zinc-800" />

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800/80 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out of RBflix</span>
                    </button>
                  </>
                ) : (
                  <div className="p-3">
                    <p className="text-xs text-zinc-400 mb-3 text-center">
                      Sign in to save movies to My List and track watch progress.
                    </p>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-2 bg-[#e50914] text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors shadow text-center"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 text-zinc-300 hover:text-white rounded focus-visible:outline-none"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#141414]/98 border-b border-zinc-800 px-5 py-4 space-y-3 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map(link => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (currentTab === 'search') setSearchQuery('');
                    onTabChange(link.id);
                  }}
                  className={`flex items-center justify-between py-2 text-base font-medium text-left ${
                    isActive ? 'text-[#e50914] font-bold' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>{user.isLoggedIn ? `Logged in as ${user.name}` : 'Not signed in'}</span>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (user.isLoggedIn) {
                  logout();
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="text-[#e50914] hover:underline font-semibold"
            >
              {user.isLoggedIn ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
