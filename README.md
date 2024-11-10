# 🎬 FlipFilm

FlipFilm is a modern social movie tracking platform that revolutionizes how you rate and share your cinematic experiences. With our unique multi-dimensional rating system, you can express your thoughts on a movie's Story, Looks, Feels, and Sounds using our signature "Dog Scale" (🐕).

![FlipFilm Screenshot](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=400)

## ✨ Features

- **Intuitive Movie Tracking**
  - Search and add movies from TMDB's vast database
  - Rate movies across multiple dimensions
  - Add personal notes and watching dates
  - Flip card interface for detailed movie information

- **Social Integration**
  - Connect with friends and discover their movie tastes
  - Share ratings on social media platforms
  - View friends' recent movie activities
  - Real-time activity feed

- **Unique Rating System**
  - Story (Plot & Writing)
  - Looks (Cinematography & Visuals)
  - Feels (Emotional Impact)
  - Sounds (Music & Sound Design)

- **Modern Tech Stack**
  - React 18 with TypeScript
  - Tailwind CSS for responsive design
  - Firebase Authentication & Firestore
  - Real-time updates and notifications

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flipfilm.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with your Firebase and TMDB credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_TMDB_API_KEY=your_tmdb_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🎯 Usage

1. **Sign Up/Login**
   - Create an account or sign in
   - Customize your profile

2. **Add Movies**
   - Search for movies using the search bar
   - Click "Add Movie" to track a new film
   - Rate each aspect using the Dog Scale
   - Add personal notes

3. **Connect with Friends**
   - Search for friends by email
   - View their recent activities
   - Share your ratings

## 🛠️ Technical Details

### Architecture

- **Frontend**: React with TypeScript for type safety
- **State Management**: React Context and Hooks
- **Styling**: Tailwind CSS with custom animations
- **Database**: Firebase Firestore for real-time data
- **Authentication**: Firebase Auth
- **API**: TMDB for movie data

### Key Components

- `MovieCard`: Flip card interface for movie details
- `RatingSection`: Custom rating component
- `FriendsList`: Social features management
- `AddMovieModal`: Movie search and addition

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for their comprehensive movie database
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [React](https://reactjs.org/) for the UI framework

## 📧 Contact

For questions or feedback, please reach out to us at:
- Email: support@flipfilm.app
- Twitter: [@FlipFilm](https://twitter.com/flipfilm)
- Website: [flipfilm.app](https://flipfilm.app)