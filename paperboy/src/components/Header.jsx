import { FiSearch, FiTrendingUp } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styles from "./Header.module.css";
import axios from "axios";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayedPoints, setDisplayedPoints] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // --- State for debouncing the search input ---
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  // ---

  // Function to fetch profile and update points (used as fallback)
  const fetchProfileAndSetPoints = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.user?.points !== undefined) {
        const points = res.data.user.points;
        setDisplayedPoints(points);
        localStorage.setItem("userPoints", points.toString());
      } else {
        setDisplayedPoints(0);
        localStorage.setItem("userPoints", "0");
      }
    } catch (err) {
      console.error("Error fetching points for header:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        handleLogout();
      } else {
        setDisplayedPoints(0);
      }
    }
  };

  // Effect runs on mount and when login status might change
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const storedPoints = localStorage.getItem("userPoints");
      if (storedPoints !== null) {
        setDisplayedPoints(parseInt(storedPoints, 10));
      } else {
        fetchProfileAndSetPoints(token);
      }
    } else {
      setIsLoggedIn(false);
      setDisplayedPoints(null);
      localStorage.removeItem("userPoints");
    }

    const handlePointsUpdate = () => {
      const updatedPoints = localStorage.getItem("userPoints");
      if (updatedPoints !== null) {
        setDisplayedPoints(parseInt(updatedPoints, 10));
      }
    };
    window.addEventListener('pointsUpdated', handlePointsUpdate);

    return () => { // Cleanup
      window.removeEventListener('pointsUpdated', handlePointsUpdate);
    };
  }, [isLoggedIn]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userPoints");
    setIsLoggedIn(false);
    navigate("/");
  };

  // --- Search Logic ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setResults([]);
      setQuery("");
    }
  };

  // --- UPDATED: Debounced Search Handler ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value); // Update the input field immediately

    // Clear the old timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (value.length < 3) {
      setResults([]);
      return;
    }

    // Set a new timeout
    const newTimeout = setTimeout(async () => {
      try {
        console.log(`[Debounced Search] Searching for: "${value}"`); // Log to show it's working
        const res = await axios.get(`http://localhost:5000/api/search-news?q=${encodeURIComponent(value)}`);
        setResults(res.data);
      } catch (err) {
        console.error("Error searching news:", err);
        setResults([]);
      }
    }, 300); // Wait 300ms after user stops typing

    setDebounceTimeout(newTimeout);
  };
  // --- End Updated Search Logic ---

  return (
    <header className={styles.header}>
      <h1 className={styles.logo} onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Paperboy</h1>

      <div className={styles.searchContainer} ref={searchRef}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search news articles..."
          value={query}
          onChange={handleSearchChange} // This now calls the debounced handler
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
        />
        {results.length > 0 && (
          <ul className={styles.resultsDropdown}>
            {results.map((r, i) => (
              <li
                key={i}
                className={styles.resultsItem}
                onClick={() => { window.open(r.url, "_blank"); setResults([]); setQuery(""); }}
              >
                {r.title} <span className={styles.resultsSource}>({r.source})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.authLinks}>
        {isLoggedIn ? (
          <div className={styles.userMenu}>
            <div className={styles.userPoints}>
              <FiTrendingUp />
              <span>{displayedPoints !== null ? displayedPoints.toLocaleString() : '...'} Points</span>
            </div>
            <div className={styles.profileIcon} onClick={() => navigate("/profile")}>
              <img src="/profile.png" alt="Profile" className={styles.avatar} />
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}> Logout </button>
          </div>
        ) : (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link to="/register" className={styles.link}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;