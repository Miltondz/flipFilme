import React from 'react';
import { Share2 } from 'lucide-react';
import { generateShareableLink } from '../lib/firebase';

interface ShareButtonProps {
  movieData: any;
}

export default function ShareButton({ movieData }: ShareButtonProps) {
  const handleShare = async () => {
    const shareLinks = generateShareableLink(movieData);
    
    // If Web Share API is available, use it
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FlipFilm - ${movieData.title}`,
          text: `Check out my rating for ${movieData.title} on FlipFilm!`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to custom share dialog
        openShareDialog(shareLinks);
      }
    } else {
      // Fallback to custom share dialog
      openShareDialog(shareLinks);
    }
  };

  const openShareDialog = (shareLinks: any) => {
    window.open(shareLinks.twitter, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}