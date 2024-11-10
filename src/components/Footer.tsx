import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex space-x-6 mb-4">
            <a href="https://twitter.com/flipfilm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="https://facebook.com/flipfilm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="https://instagram.com/flipfilm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="https://youtube.com/flipfilm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Youtube className="h-6 w-6" />
            </a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} FlipFilm. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}