import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2, Film } from 'lucide-react';
import { auth, searchUsers, addFriend, getFriends, getFriendRecentMovies, MovieData } from '../lib/firebase';
import toast from 'react-hot-toast';

interface Friend {
  id: string;
  email: string;
  username: string;
}

export default function FriendsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendMovies, setFriendMovies] = useState<{ [key: string]: MovieData[] }>({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (auth.currentUser) {
      loadFriends();
    }
  }, []);

  const loadFriends = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const friendsList = await getFriends();
      setFriends(friendsList || []);

      if (friendsList && friendsList.length > 0) {
        const moviesData: { [key: string]: MovieData[] } = {};
        const loadingStates: { [key: string]: boolean } = {};

        for (const friend of friendsList) {
          loadingStates[friend.id] = true;
          setLoadingMovies(loadingStates);

          try {
            const recentMovies = await getFriendRecentMovies(friend.id);
            moviesData[friend.id] = recentMovies;
          } catch (error) {
            console.error(`Error loading movies for friend ${friend.id}:`, error);
            moviesData[friend.id] = [];
          } finally {
            loadingStates[friend.id] = false;
            setLoadingMovies({ ...loadingStates });
          }
        }
        setFriendMovies(moviesData);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to add friends');
      return;
    }

    try {
      await addFriend(friendId);
      toast.success('Friend added successfully!');
      setSearchQuery('');
      setSearchResults([]);
      await loadFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to add friend');
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-400 text-lg mb-4">Please sign in to manage friends</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Users Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Find Friends</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by email or username..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends List Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">My Friends</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No friends added yet</p>
            <p className="text-gray-500 text-sm mt-2">Search for users to add them as friends</p>
          </div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{friend.username}</h3>
                    <p className="text-gray-400 text-sm">{friend.email}</p>
                  </div>
                </div>
                
                {/* Recent Movies */}
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Recent movies:</p>
                  {loadingMovies[friend.id] ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                    </div>
                  ) : friendMovies[friend.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {friendMovies[friend.id].map((movie) => (
                        <div
                          key={movie.id}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <Film className="h-4 w-4 text-indigo-400" />
                          <span>{movie.title}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(movie.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent movies</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}