import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FriendRating {
  friendEmail: string;
  ratings: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  };
}

interface FriendRatingsProps {
  movieId: string;
  className?: string;
}

export default function FriendRatings({ movieId, className = '' }: FriendRatingsProps) {
  const [friendRatings, setFriendRatings] = useState<FriendRating[]>([]);

  useEffect(() => {
    const loadFriendRatings = async () => {
      try {
        const ratingsQuery = query(
          collection(db, 'movies'),
          where('tmdb_id', '==', movieId)
        );
        const snapshot = await getDocs(ratingsQuery);
        
        const ratings = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const movieData = doc.data();
            const userDoc = await getDocs(
              query(collection(db, 'users'), where('id', '==', movieData.userId))
            );
            const userData = userDoc.docs[0]?.data();
            
            return {
              friendEmail: userData?.email || 'Unknown User',
              ratings: movieData.ratings
            };
          })
        );

        setFriendRatings(ratings);
      } catch (error) {
        console.error('Error loading friend ratings:', error);
      }
    };

    loadFriendRatings();
  }, [movieId]);

  if (friendRatings.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-300">Friend Ratings</h4>
      <div className="space-y-3">
        {friendRatings.map((rating, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm font-medium text-gray-400">{rating.friendEmail}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(rating.ratings).map(([type, value]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-gray-500 capitalize">{type}:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: value }).map((_, i) => (
                      <span key={i} className="text-yellow-400">🐕</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}