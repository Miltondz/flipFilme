import React, { useState, useCallback } from 'react';
import { Film, Search, User, LogOut, Loader2 } from 'lucide-react';
import { tmdbApi, Movie } from '../services/tmdb';
import debounce from 'lodash/debounce';
import { auth, logOut } from '../lib/firebase';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';

interface HeaderProps {
  onSearch?: (movies: Movie[]) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searching, setSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        const popularMovies = await tmdbApi.getPopularMovies();
        onSearch?.(popularMovies);
        setSearching(false);
        return;
      }

      const results = await tmdbApi.searchMovies(query);
      onSearch?.(results);
      setSearching(false);
    }, 500),
    [onSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearching(true);
    debouncedSearch(e.target.value);
  };

  const handleAuthClick = async () => {
    if (auth.currentUser) {
      try {
        await logOut();
        toast.success('Logged out successfully');
      } catch (error) {
        toast.error('Error logging out');
      }
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Film className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-bold">FlipFilm</span>
            </div>
            
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {searching ? (
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search movies..."
                />
              </div>
            </div>

            <button
              onClick={handleAuthClick}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {auth.currentUser ? (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}