import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import styles from './App.module.css';
import NewsCarousel from './components/NewsCarousel';
import CategoryNav from './components/CategoryNav';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('trending');
  const [user, setUser] = useState(undefined); // Start as undefined to track loading
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  // Fetch user profile if token exists
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user); // Set the user object
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token'); // Invalid token, remove it
        setUser(null); // Set to null (not logged in)
      }
    } else {
      setUser(null); // No token, not logged in
    }
  };

  // Fetch user on initial load
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // --- THIS IS THE FIX ---
  // This logic now *only* depends on the category.
  // It will fetch polls and keep them, even when you navigate away.
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/questions?category=${category}`
        );
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [category]); // Only re-run when category changes

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Pass user, setUser, questions, and loading state to all child routes
  const contextValue = { user, setUser, questions, loading };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <main>
        {isHomePage && (
          <>
            <NewsCarousel />
            <CategoryNav
              currentCategory={category}
              onSelectCategory={setCategory}
            />
          </>
        )}
        <div className={styles.container}>
          {/* Outlet renders the correct child page (Home, Login, MarketDetail, etc.) */}
          {/* We pass the context to all of them */}
          <Outlet context={contextValue} />
        </div>
      </main>
    </>
  );
}

export default App;