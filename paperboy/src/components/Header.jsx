import { FiSearch, FiTrendingUp } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styles from "./Header.module.css";
import axios from "axios";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayedPoints, setDisplayedPoints] = useState(null); // Use null to indicate "not loaded yet"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Function to fetch profile and update points
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
        localStorage.setItem("userPoints", points.toString()); // Store fetched points
      } else {
        console.warn("[Header] Points field missing from profile response, defaulting to 0.");
        setDisplayedPoints(0);
        localStorage.setItem("userPoints", "0");
      }
    } catch (err) {
      console.error("Error fetching points for header:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        // Token is invalid, trigger logout
        handleLogout();
      } else {
        // For other errors, maybe show 0 or keep existing state? Let's show 0.
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
        console.log("[Header] Using points from localStorage:", storedPoints);
        setDisplayedPoints(parseInt(storedPoints, 10));
      } else {
        // If not in storage, fetch immediately
        fetchProfileAndSetPoints(token);
      }
    } else {
      setIsLoggedIn(false);
      setDisplayedPoints(null);
      localStorage.removeItem("userPoints");
    }

    // Event Listener for updates from other components
    const handlePointsUpdate = () => {
      console.log("[Header] pointsUpdated event received.");
      const updatedPoints = localStorage.getItem("userPoints");
      console.log("[Header] Points read from localStorage on event:", updatedPoints);
      if (updatedPoints !== null) {
        setDisplayedPoints(parseInt(updatedPoints, 10));
      } else {
         console.warn("[Header] userPoints not found in localStorage during update event");
         // Maybe fetch profile again as a fallback? For now, just log.
      }
    };
    window.addEventListener('pointsUpdated', handlePointsUpdate);

    return () => { // Cleanup
      window.removeEventListener('pointsUpdated', handlePointsUpdate);
    };
  }, [isLoggedIn]); // Dependency array includes isLoggedIn

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userPoints");
    setIsLoggedIn(false); // Update state FIRST
    // No need to setDisplayedPoints(null) here, useEffect will handle it
    navigate("/");
  };

  // --- Search Logic (ensure full implementation is present) ---
  useEffect(() => { /* ... Click outside handler ... */ }, []);
  const handleKeyDown = (e) => { /* ... Escape key handler ... */ };
  const handleSearchChange = async (e) => { /* ... Search logic ... */ };
  // ---

  console.log("[Header] Rendering Header, current displayedPoints:", displayedPoints);

  return (
    <header className={styles.header}>
      {/* Logo */}
      <h1 className={styles.logo} onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Paperboy</h1>

      {/* Search Bar */}
      <div className={styles.searchContainer} ref={searchRef}>
        <FiSearch className={styles.searchIcon} />
        <input type="text" placeholder="Search news markets" value={query} onChange={handleSearchChange} onKeyDown={handleKeyDown} className={styles.searchInput} />
        {results.length > 0 && (
          <ul className={styles.resultsDropdown}> {results.map((r, i) => ( <li key={i} className={styles.resultsItem} onClick={() => { window.open(r.url, "_blank"); setResults([]); setQuery(""); }}> {r.title} <span className={styles.resultsSource}>({r.source})</span> </li> ))} </ul>
        )}
      </div>

      {/* Auth Section */}
      <div className={styles.authLinks}>
        {isLoggedIn ? (
          <div className={styles.userMenu}>
            {/* Display Points */}
            <div className={styles.userPoints}>
              <FiTrendingUp />
              <span>{displayedPoints !== null ? displayedPoints.toLocaleString() : '...'} Points</span>
            </div>
            {/* Profile Icon */}
            <div className={styles.profileIcon} onClick={() => navigate("/profile")}> <img src="/profile.png" alt="Profile" className={styles.avatar} /> </div>
            {/* Logout Button */}
            <button onClick={handleLogout} className={styles.logoutBtn}> Logout </button>
          </div>
        ) : (
          <> <Link to="/login" className={styles.link}>Login</Link> <Link to="/register" className={styles.link}>Register</Link> </>
        )}
      </div>
    </header>
  );
};

export default Header;