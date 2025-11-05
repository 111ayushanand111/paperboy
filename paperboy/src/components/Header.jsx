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

  const fetchProfileAndSetPoints = async (token) => {
    console.log("[Header] Fetching profile data...");
    try {
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.user?.points !== undefined) {
        const points = res.data.user.points;
        console.log("[Header] Fetched points from profile:", points);
        setDisplayedPoints(points);
        localStorage.setItem("userPoints", points.toString());
      } else {
        console.warn("[Header] Points field missing from profile response, defaulting to 0.");
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const storedPoints = localStorage.getItem("userPoints");
      if (storedPoints !== null) {
        console.log("[Header] Using points from localStorage:", storedPoints);
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
      console.log("[Header] pointsUpdated event received.");
      const updatedPoints = localStorage.getItem("userPoints");
      console.log("[Header] Points read from localStorage on event:", updatedPoints);
      if (updatedPoints !== null) {
        setDisplayedPoints(parseInt(updatedPoints, 10));
      } else {
         console.warn("[Header] userPoints not found in localStorage during update event");
      }
    };
    window.addEventListener('pointsUpdated', handlePointsUpdate);

    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate);
    };
  }, [isLoggedIn]);

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

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 3) {
      setResults([]);
      return;
    }
    try {
      // This endpoint is now fixed on the backend to use the free-tier-friendly
      // /top-headlines?q=... endpoint
      const res = await axios.get(`http://localhost:5000/api/search-news?q=${encodeURIComponent(value)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Error searching news:", err);
      setResults([]);
    }
  };
  // --- End Search Logic ---

  console.log("[Header] Rendering Header, current displayedPoints:", displayedPoints);

  return (
    <header className={styles.header}>
      <h1 className={styles.logo} onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Paperboy</h1>

      <div className={styles.searchContainer} ref={searchRef}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search news articles..." // Updated placeholder
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
        />
        {results.length > 0 && (
          <ul className={styles.resultsDropdown}>
            {results.map((r, i) => (
              <li
                key={i}
                className={styles.resultsItem}
                // Click opens article in new tab
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