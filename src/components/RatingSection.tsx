import React from 'react';

interface RatingSectionProps {
  label: string;
  rating: number;
  onChange: (value: number) => void;
}

export default function RatingSection({ label, rating, onChange }: RatingSectionProps) {
  const maxRating = 5;
  
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-sm font-medium text-gray-300">{label}</span>
      <div className="flex gap-1">
        {[...Array(maxRating)].map((_, index) => (
          <button
            key={index}
            onClick={() => onChange(index + 1)}
            className={`text-lg transition-colors ${
              index < rating ? 'opacity-100' : 'opacity-30'
            }`}
          >
            🐕
          </button>
        ))}
      </div>
    </div>
  );
}