import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Header.module.css';
import { FaSearch, FaUserCircle, FaSignOutAlt, FaCrown } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function Header({ user, onLogout }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  // --- THIS IS THE FIX ---
  // This hook watches for changes in 'query'.
  // When you stop typing for 300ms, it will run the search.
  useEffect(() => {
    // If the query is empty, clear results and don't do anything
    if (!query.trim()) {
      setResults([]);
      setIsSearchLoading(false);
      return;
    }

    // Set loading state
    setIsSearchLoading(true);

    // Set a timer for 300ms
    const searchTimer = setTimeout(() => {
      // After 300ms, run the search
      axios.get(`${API_URL}/search-news?q=${query}`)
        .then(res => {
          setResults(res.data);
          setIsSearchLoading(false);
        })
        .catch(err => {
          console.error('Error fetching search results:', err);
          setResults([]); // Clear results on error
          setIsSearchLoading(false);
        });
    }, 300); // 300ms debounce

    // This is a cleanup function.
    // If you type again, it cancels the previous timer.
    return () => {
      clearTimeout(searchTimer);
    };
  }, [query]); // This effect re-runs every time 'query' changes
  // --- END FIX ---

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent form from reloading page
    // The useEffect above already handles the search
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const handleFocus = () => setIsSearchFocused(true);
  
  // Use a timeout on blur to allow for clicks on results
  const handleBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 150); // 150ms delay
  };
  
  // Clear results and query when a link is clicked
  const handleResultClick = () => {
    setQuery('');
    setResults([]);
    setIsSearchFocused(false);
  };

  return (
    <header className={styles.header}>
      <div className={`${styles.headerContent} container`}>
        <Link to="/" className={styles.logo}>
          📰 Paperboy
        </Link>

        <div
          className={styles.searchContainer}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {/* Form now only prevents reload, search is handled by useEffect */}
          <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news..."
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>
          
          {/* UPDATED RESULTS DROPDOWN */}
          {isSearchFocused && query.length > 0 && (
            <div className={styles.searchResults}>
              {isSearchLoading ? (
                <div className={styles.searchMessage}>Loading...</div>
              ) : (
                results.length > 0 ? (
                  results.map((result, index) => (
                    <a
                      key={index}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.searchResultItem}
                      onClick={handleResultClick}
                    >
                      {result.title}
                      <span>{result.source}</span>
                    </a>
                  ))
                ) : (
                  <div className={styles.searchMessage}>No results found.</div>
                )
              )}
            </div>
          )}
          {/* --- END UPDATED DROPDOWN --- */}
        </div>

        <nav className={styles.nav}>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className={styles.navLink}>
                  <FaCrown />
                  <span className={styles.navText}>Admin</span>
                </Link>
              )}
              <Link to="/profile" className={styles.navLink}>
                <FaUserCircle />
                <span className={styles.navText}>{user.username}</span>
              </Link>
              <button
                onClick={handleLogoutClick}
                className={`${styles.navLink} ${styles.logoutButton}`}
              >
                <FaSignOutAlt />
                <span className={styles.navText}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navButton}>
                Login
              </Link>
              <Link to="/register" className={`${styles.navButton} ${styles.registerButton}`}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;