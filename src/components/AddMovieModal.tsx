import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Movie, tmdbApi } from '../services/tmdb';
import { auth, addMovieToDatabase } from '../lib/firebase';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMovieModal({ isOpen, onClose }: AddMovieModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [ratings, setRatings] = useState({
    story: 0,
    looks: 0,
    feels: 0,
    sounds: 0
  });
  const [loading, setLoading] = useState(false);

  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    try {
      const results = await tmdbApi.searchMovies(query);
      setSearchResults(results);
    } catch (error) {
      toast.error('Error searching movies');
    } finally {
      setSearching(false);
    }
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedMovie(null);
    setSearching(true);
    debouncedSearch(query);
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRatingChange = (type: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [type]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedMovie || !auth.currentUser) return;

    setLoading(true);
    try {
      await addMovieToDatabase({
        ...selectedMovie,
        watchedDate,
        notes,
        ratings
      });

      toast.success('Movie added successfully!');
      handleCancel();
    } catch (error) {
      toast.error('Error adding movie');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedMovie(null);
    setSearchQuery('');
    setSearchResults([]);
    setWatchedDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setRatings({
      story: 0,
      looks: 0,
      feels: 0,
      sounds: 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add Movie</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!selectedMovie ? (
          <>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for a movie..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                disabled={loading}
              />
              {searching ? (
                <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center gap-4 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleMovieSelect(movie)}
                >
                  <img
                    src={tmdbApi.getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium text-white">{movie.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(movie.release_date).getFullYear()}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {movie.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <img
                src={tmdbApi.getImageUrl(selectedMovie.poster_path)}
                alt={selectedMovie.title}
                className="w-32 h-48 object-cover rounded"
              />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedMovie.title}</h3>
                <p className="text-gray-400 mb-2">
                  {new Date(selectedMovie.release_date).getFullYear()}
                </p>
                <p className="text-sm text-gray-300">{selectedMovie.overview}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                When did you watch it?
              </label>
              <input
                type="date"
                value={watchedDate}
                onChange={(e) => setWatchedDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-24 resize-none"
                placeholder="Add your thoughts about the movie..."
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Ratings</h4>
              {Object.entries(ratings).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="w-16 text-gray-300 capitalize">{key}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingChange(key as keyof typeof ratings, rating)}
                        className={`text-2xl transition-colors ${
                          rating <= value ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        🐕
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Movie'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}