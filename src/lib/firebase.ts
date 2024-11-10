import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  setDoc,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  getDoc,
  arrayUnion,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyABB-JTuZ0PYCsOKeW1CwCyNitL9mOIrME",
  authDomain: "flipmovie-d59ed.firebaseapp.com",
  projectId: "flipmovie-d59ed",
  storageBucket: "flipmovie-d59ed.appspot.com",
  messagingSenderId: "607962781640",
  appId: "1:607962781640:web:36f1cdbfbd50fde83a92fd",
  measurementId: "G-W294SFPHTD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface MovieData extends DocumentData {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
  ratings?: {
    story: number;
    looks: number;
    feels: number;
    sounds: number;
  };
}

export interface FriendData {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

// Helper function to create a query with proper error handling
const createQuery = (collectionRef: any, ...queryConstraints: QueryConstraint[]) => {
  try {
    return query(collectionRef, ...queryConstraints);
  } catch (error) {
    console.error('Error creating query:', error);
    throw error;
  }
};

export const signUp = async (email: string, username: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    
    const userData = {
      email,
      username,
      createdAt: Timestamp.now(),
      friends: []
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    return userCredential;
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    window.location.reload();
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const addMovieToDatabase = async (movieData: any) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    const docData = {
      userId: auth.currentUser.uid,
      ...movieData,
      createdAt: Timestamp.now(),
      public: true
    };
    
    const docRef = await addDoc(collection(db, 'movies'), docData);
    return docRef.id;
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const deleteMovie = async (movieId: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    await deleteDoc(doc(db, 'movies', movieId));
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const searchUsers = async (searchTerm: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    const usersRef = collection(db, 'users');
    const q = createQuery(
      usersRef,
      where('email', '>=', searchTerm.toLowerCase()),
      where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => user.id !== auth.currentUser?.uid);
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const addFriend = async (friendId: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const friendRef = doc(db, 'users', friendId);
    
    // Create friendship document
    const friendshipId = [userId, friendId].sort().join('_');
    await setDoc(doc(db, 'friends', friendshipId), {
      users: [userId, friendId],
      createdAt: Timestamp.now(),
      status: 'active'
    });

    // Update user's friends list
    await updateDoc(userRef, {
      friends: arrayUnion(friendId)
    });

    // Update friend's friends list
    await updateDoc(friendRef, {
      friends: arrayUnion(userId)
    });
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const getFriends = async (): Promise<FriendData[]> => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  try {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const userData = userDoc.data();
    
    if (!userData?.friends || !Array.isArray(userData.friends)) {
      return [];
    }

    const friendsData = await Promise.all(
      userData.friends.map(async (friendId: string) => {
        try {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (!friendDoc.exists()) return null;
          
          const data = friendDoc.data();
          return {
            id: friendDoc.id,
            email: data.email,
            username: data.username,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          } as FriendData;
        } catch (error) {
          console.error(`Error fetching friend data for ${friendId}:`, error);
          return null;
        }
      })
    );
    
    return friendsData.filter((friend): friend is FriendData => friend !== null);
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Firebase error getting friends:', error);
      throw new Error('Failed to load friends list');
    }
    throw error;
  }
};

export const getFriendRecentMovies = async (friendId: string): Promise<MovieData[]> => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  if (!friendId) return [];

  try {
    // First check if the user is actually friends with the requested friendId
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const userData = userDoc.data();
    
    if (!userData?.friends?.includes(friendId)) {
      return [];
    }

    const moviesRef = collection(db, 'movies');
    
    // Try with full query first (including ordering)
    try {
      const q = createQuery(
        moviesRef,
        where('userId', '==', friendId),
        where('public', '==', true),
        orderBy('createdAt', 'desc'),
        limit(2)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString()
        } as MovieData;
      });
    } catch (error) {
      // If the ordered query fails, try without ordering
      if (error instanceof FirebaseError && error.code === 'failed-precondition') {
        const fallbackQuery = createQuery(
          moviesRef,
          where('userId', '==', friendId),
          where('public', '==', true)
        );
        
        const querySnapshot = await getDocs(fallbackQuery);
        const movies = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString()
          } as MovieData;
        });

        // Sort manually and limit results
        return movies
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching friend movies:', error);
    return [];
  }
};

export const generateShareableLink = (movieData: any) => {
  const baseUrl = window.location.origin;
  const shareText = `Check out what I'm watching on FlipFilm!\n\n` +
    `🎬 ${movieData.title} (${new Date(movieData.release_date).getFullYear()})\n\n` +
    `My ratings:\n` +
    `Story: ${movieData.ratings?.story || 0}🐕\n` +
    `Looks: ${movieData.ratings?.looks || 0}🐕\n` +
    `Feels: ${movieData.ratings?.feels || 0}🐕\n` +
    `Sounds: ${movieData.ratings?.sounds || 0}🐕\n\n` +
    `Join me at ${baseUrl}`;
    
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}&quote=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
  };
};