import React, { useState } from 'react';
import { Star, Clock, Share2, Trash2 } from 'lucide-react';
import { Movie } from '../services/tmdb';
import RatingSection from './RatingSection';
import ShareButton from './ShareButton';
import { deleteMovie } from '../lib/firebase';
import toast from 'react-hot-toast';

interface MovieCardProps {
  movie: Movie;
  ratings: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  };
}

export default function MovieCard({ movie, ratings }: MovieCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteMovie(movie.id);
      toast.success('Movie deleted successfully');
    } catch (error) {
      toast.error('Failed to delete movie');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderRatingDogs = (rating: number) => {
    return '🐕'.repeat(Math.min(Math.max(0, rating), 5));
  };

  return (
    <div 
      className="relative h-[600px] w-full cursor-pointer group perspective"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative preserve-3d duration-500 w-full h-full ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative h-full overflow-hidden rounded-xl bg-gray-900 shadow-xl transition-all duration-200 group-hover:shadow-2xl">
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750'}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{movie.title}</h3>
                    <div className="flex items-center gap-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-100">{Number(movie.vote_average).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-300 mr-1" />
                        <span className="text-sm text-gray-300">
                          {new Date(movie.release_date).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ShareButton movieData={movie} />
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 h-full w-full rounded-xl bg-gray-900 p-6 text-gray-100 rotate-y-180 backface-hidden overflow-y-auto">
          <div className="flex h-full flex-col">
            <h3 className="text-2xl font-bold mb-4">{movie.title}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Ratings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Story</span>
                    <span>{renderRatingDogs(ratings.story)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Looks</span>
                    <span>{renderRatingDogs(ratings.looks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Feels</span>
                    <span>{renderRatingDogs(ratings.feels)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sounds</span>
                    <span>{renderRatingDogs(ratings.sounds)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Overview</h4>
                <p className="text-sm leading-relaxed text-gray-300">
                  {movie.overview}
                </p>
              </div>

              {movie.notes && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Notes</h4>
                  <p className="text-sm leading-relaxed text-gray-300">
                    {movie.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}