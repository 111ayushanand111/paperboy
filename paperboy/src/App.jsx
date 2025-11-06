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
  const [category, setCategory] = useState('all'); 
  const [user, setUser] = useState(undefined); 
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
        setUser(data.user); 
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token'); 
        setUser(null); 
      }
    } else {
      setUser(null); 
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
  }, [category]); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

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
          <Outlet context={contextValue} />
        </div>
      </main>
    </>
  );
}

export default App;