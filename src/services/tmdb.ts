import axios from 'axios';

const API_KEY = 'c83783145d45b3bd439ab966d0d54650';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  tmdb_id?: number;
  ratings?: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  };
  notes?: string;
}

export const tmdbApi = {
  async searchMovies(query: string): Promise<Movie[]> {
    if (!query) return [];
    try {
      const response = await axios.get(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
          query
        )}&page=1`
      );
      return response.data.results.map((movie: any) => ({
        ...movie,
        tmdb_id: movie.id,
        id: `tmdb_${movie.id}`
      }));
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  },

  async getRandomRecentMovies(): Promise<Movie[]> {
    try {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      
      const response = await axios.get(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=${threeYearsAgo.toISOString().split('T')[0]}`
      );
      
      return response.data.results
        .slice(0, 9)
        .map((movie: any) => ({
          ...movie,
          tmdb_id: movie.id,
          id: `tmdb_${movie.id}`
        }));
    } catch (error) {
      console.error('Error fetching random movies:', error);
      return [];
    }
  },

  getImageUrl(path: string | null): string {
    if (!path) return 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800';
    return `${IMAGE_BASE_URL}${path}`;
  }
};