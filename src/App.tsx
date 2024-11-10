import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MovieGrid from './components/MovieGrid';
import FriendsList from './components/FriendsList';
import Footer from './components/Footer';

type View = 'movies' | 'friends';

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<View>('movies');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authInitialized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      <Toaster position="top-center" />
      <Header />
      <div className="flex-grow flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {currentView === 'movies' ? <MovieGrid /> : <FriendsList />}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;