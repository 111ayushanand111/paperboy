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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);

    const searchTimer = setTimeout(() => {
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
    }, 300); 

    return () => {
      clearTimeout(searchTimer);
    };
  }, [query]); 

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const handleFocus = () => setIsSearchFocused(true);
  
  const handleBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 150); //150ms delay
  };
  
  //Clear results and query when a link is clicked
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