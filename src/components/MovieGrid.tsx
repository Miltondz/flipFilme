import React, { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Movie, tmdbApi } from '../services/tmdb';
import MovieCard from './MovieCard';
import AddMovieModal from './AddMovieModal';
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, QueryConstraint } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function MovieGrid() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    const loadMovies = async () => {
      setLoading(true);
      try {
        if (auth.currentUser) {
          const moviesRef = collection(db, 'movies');
          const constraints: QueryConstraint[] = [
            where('userId', '==', auth.currentUser.uid)
          ];

          // Add orderBy only if we have the necessary index
          try {
            const q = query(
              moviesRef,
              ...constraints,
              orderBy('createdAt', 'desc')
            );
            
            unsubscribe = onSnapshot(q, 
              (snapshot) => {
                const movieData = snapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp 
                      ? data.createdAt.toDate().toISOString()
                      : new Date().toISOString(),
                    ratings: {
                      story: Number(data.ratings?.story) || 0,
                      looks: Number(data.ratings?.looks) || 0,
                      feels: Number(data.ratings?.feels) || 0,
                      sounds: Number(data.ratings?.sounds) || 0
                    }
                  };
                }) as Movie[];
                setMovies(movieData);
                setLoading(false);
              },
              (error) => {
                // If we get an index error, try without ordering
                if (error.code === 'failed-precondition') {
                  const fallbackQuery = query(moviesRef, ...constraints);
                  unsubscribe = onSnapshot(fallbackQuery,
                    (snapshot) => {
                      const movieData = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                          id: doc.id,
                          ...data,
                          createdAt: data.createdAt instanceof Timestamp 
                            ? data.createdAt.toDate().toISOString()
                            : new Date().toISOString(),
                          ratings: {
                            story: Number(data.ratings?.story) || 0,
                            looks: Number(data.ratings?.looks) || 0,
                            feels: Number(data.ratings?.feels) || 0,
                            sounds: Number(data.ratings?.sounds) || 0
                          }
                        };
                      }) as Movie[];
                      
                      // Sort manually if we can't use orderBy
                      movieData.sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      );
                      
                      setMovies(movieData);
                      setLoading(false);
                    },
                    (fallbackError) => {
                      console.error('Error in fallback movie query:', fallbackError);
                      toast.error('Failed to load movies');
                      setLoading(false);
                    }
                  );
                } else {
                  console.error('Error in movie snapshot listener:', error);
                  toast.error('Failed to load movies');
                  setLoading(false);
                }
              }
            );
          } catch (error) {
            console.error('Error setting up movie query:', error);
            toast.error('Failed to load movies');
            setLoading(false);
          }
        } else {
          const randomMovies = await tmdbApi.getRandomRecentMovies();
          setMovies(randomMovies);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        toast.error('Failed to load movies');
        setLoading(false);
      }
    };

    loadMovies();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth.currentUser]);

  const handleAddClick = () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to add movies');
      return;
    }
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
        {auth.currentUser && (
          <div 
            onClick={handleAddClick}
            className="relative h-[600px] w-full cursor-pointer group"
          >
            <div className="h-full rounded-xl bg-gray-800 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition-all">
              <Plus className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">Add New Movie</p>
            </div>
          </div>
        )}

        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            ratings={{
              story: Number(movie.ratings?.story) || 0,
              looks: Number(movie.ratings?.looks) || 0,
              feels: Number(movie.ratings?.feels) || 0,
              sounds: Number(movie.ratings?.sounds) || 0
            }}
          />
        ))}
      </div>

      <AddMovieModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </>
  );
}