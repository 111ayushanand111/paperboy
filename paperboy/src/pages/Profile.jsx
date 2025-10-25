import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header"; // Import Header
import styles from "./Profile.module.css"; // Import the CSS module

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ attempted: 0, correct: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // State for error messages

  useEffect(() => {
    const fetchProfile = async () => {
      setError(""); // Clear previous errors
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not logged in. Please log in to view your profile.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.user) {
          setUser(res.data.user);
          setStats(res.data.stats || { attempted: 0, correct: 0 }); // Use default if stats missing
          setLeaderboard(res.data.leaderboard || []); // Use default if leaderboard missing
        } else {
            throw new Error("Invalid profile data received.");
        }

      } catch (err) {
        console.error("Error fetching profile:", err);
        const message = err.response?.data?.message || err.message || "Could not load profile data.";
        // Handle specific auth errors
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            setError("Session expired or invalid. Please log in again.");
            // Optionally clear token here: localStorage.removeItem("token");
        } else {
             setError(message);
        }
        setUser(null); // Clear user data on error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Run only once on component mount

  // Calculate accuracy only if user and stats are loaded
  const accuracy = (user && stats.attempted > 0)
    ? ((stats.correct / stats.attempted) * 100).toFixed(1)
    : 0;

  // --- Render Logic ---

  if (loading) {
    return <div className={styles.message}>Loading profile...</div>;
  }

  if (error) {
     return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
  }

  // Should only reach here if loading is false, error is empty, and user is loaded
  if (!user) {
      // This case might occur if the API call finishes without error but user is still null (unexpected)
      return <div className={`${styles.message} ${styles.error}`}>Could not load user data. Please try logging in again.</div>;
  }


  return (
    <>
      <Header /> {/* Include Header for consistent navigation */}
      <div className={styles.profileContainer}>
        {/* User Info Card */}
        <div className={`${styles.card} ${styles.userInfoCard}`}>
           <img src="/profile.png" alt="User Avatar" className={styles.avatar} />
          <h2 className={styles.username}>{user.username}</h2>
          <p className={styles.email}>{user.email}</p>
          <p className={styles.points}>
             💰 {user.points !== undefined ? user.points.toLocaleString() : '0'} Points
          </p>
        </div>

        {/* Stats Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📊 Quiz Stats</h3>
          <div className={styles.statItem}>
            <span>Questions Attempted:</span>
            <span>{stats.attempted}</span>
          </div>
          <div className={styles.statItem}>
            <span>Correct Answers:</span>
            <span>{stats.correct}</span>
          </div>
          <div className={styles.statItem}>
            <span>Accuracy:</span>
            <span className={styles.accuracyValue}>{accuracy}%</span>
          </div>
          {/* Progress bar */}
          <div className={styles.progressBarBackground}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className={`${styles.card} ${styles.leaderboardCard}`}>
          <h3 className={styles.cardTitle}>🏆 Global Leaderboard</h3>
          {leaderboard.length > 0 ? (
            <table className={styles.leaderboardTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{u.username}</td>
                    <td className={styles.accuracyValue}>{u.accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noLeaderboard}>Leaderboard data not available.</p>
          )}
        </div>
      </div>
    </>
  );
}