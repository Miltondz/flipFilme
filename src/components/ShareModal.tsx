import React from 'react';
import { X, Twitter, Facebook, Instagram, Link2 } from 'lucide-react';
import { Movie } from '../services/tmdb';
import { auth } from '../lib/firebase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  ratings: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  };
}

export default function ShareModal({ isOpen, onClose, movie, ratings }: ShareModalProps) {
  if (!isOpen) return null;

  const username = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'A FlipFilm user';
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800';
  
  const shareText = `${username} just watched ${movie.title} (${new Date(movie.release_date).getFullYear()})

Directed by ${movie.director || 'Unknown Director'}

${movie.overview?.slice(0, 140)}${movie.overview?.length > 140 ? '...' : ''}

My ratings:
Story: ${ratings.story}🐕
Looks: ${ratings.looks}🐕
Feels: ${ratings.feels}🐕
Sounds: ${ratings.sounds}🐕

Check out FlipFilm at https://flipfilm.app`;

  const shareUrl = window.location.origin;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    instagram: `https://instagram.com/`, // Instagram doesn't support direct sharing
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Share Movie Rating</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <img 
              src={posterUrl} 
              alt={movie.title} 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="space-y-2">
              <p className="text-white font-bold">{movie.title} ({new Date(movie.release_date).getFullYear()})</p>
              <p className="text-gray-400 text-sm">{movie.overview?.slice(0, 140)}{movie.overview?.length > 140 ? '...' : ''}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-colors"
          >
            <Twitter className="h-5 w-5" />
            <span>Share on Twitter</span>
          </a>

          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-3 bg-[#4267B2]/10 hover:bg-[#4267B2]/20 text-[#4267B2] rounded-lg transition-colors"
          >
            <Facebook className="h-5 w-5" />
            <span>Share on Facebook</span>
          </a>

          <a
            href={shareLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-3 bg-[#E4405F]/10 hover:bg-[#E4405F]/20 text-[#E4405F] rounded-lg transition-colors"
          >
            <Instagram className="h-5 w-5" />
            <span>Share on Instagram</span>
          </a>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-3 w-full p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Link2 className="h-5 w-5" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}