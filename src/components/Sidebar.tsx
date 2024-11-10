import React from 'react';
import { Film, Users } from 'lucide-react';
import { auth } from '../lib/firebase';

interface SidebarProps {
  currentView: 'movies' | 'friends';
  onViewChange: (view: 'movies' | 'friends') => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  if (!auth.currentUser) return null;

  return (
    <aside className="w-16 bg-gray-900 p-2 hidden md:block">
      <nav className="space-y-2">
        <button
          onClick={() => onViewChange('movies')}
          className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
            currentView === 'movies'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title="My Movies"
        >
          <Film className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => onViewChange('friends')}
          className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
            currentView === 'friends'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title="My Friends"
        >
          <Users className="h-6 w-6" />
        </button>
      </nav>
    </aside>
  );
}