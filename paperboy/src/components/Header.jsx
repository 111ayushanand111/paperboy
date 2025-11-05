import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
// Import icons
import { FaSearch, FaUserCircle, FaSignOutAlt, FaCrown } from 'react-icons/fa';

function Header({ user, onLogout }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    console.log('Searching for:', query);
    setResults([]);
    setIsSearchFocused(false);
    // navigate(`/search?q=${query}`); // You can build this page later
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      {/* Use container class to match main content width */}
      <div className={`${styles.headerContent} container`}>
        <Link to="/" className={styles.logo}>
          📰 Paperboy
        </Link>

        <div
          className={styles.searchContainer}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        >
          <form className={styles.searchBar} onSubmit={handleSearch}>
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
          {isSearchFocused && results.length > 0 && (
            <div className={styles.searchResults}>
              {results.map((result, index) => (
                <a
                  key={index}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {result.title}
                </a>
              ))}
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {user ? (
            <>
              {/* ADMIN LINK - Only shows if user.role is 'admin' */}
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