import { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom'; // Import useOutletContext
import styles from './Profile.module.css';

const API_URL = 'http://localhost:5000/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ attempted: 0, correct: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get setUser from the App.jsx layout
  const { setUser } = useOutletContext();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Set local state for this page
        setProfile(data.user);
        setStats(data.stats);
        setLeaderboard(data.leaderboard);
        
        // --- THIS IS THE FIX ---
        // Update the main App.jsx state, which updates the Header
        if (setUser) {
          setUser(data.user);
        }
        // --- END FIX ---

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile.');
        localStorage.removeItem('token'); // Clear bad token
        if (setUser) {
          setUser(null); // Tell App.jsx we are logged out
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [setUser]); // Add setUser as a dependency

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  const accuracy =
    stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0;
  
  // Find current user's rank
  const userRank = leaderboard.findIndex(p => p.username === profile.username) + 1;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>{profile.username}'s Profile</h1>
        <p>Email: {profile.email}</p>
        <p>Points: {profile.points}</p>
      </div>

      <div className={styles.statsContainer}>
        <h2>Your Stats</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Markets</h3>
            <p>{stats.attempted}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Correct Bets</h3>
            <p>{stats.correct}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Your Rank</h3>
            <p>#{userRank > 0 ? userRank : 'N/A'}</p>
          </div>
        </div>
        <div className={styles.accuracy}>
          <h3>Accuracy</h3>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
          <p>{accuracy.toFixed(2)}%</p>
        </div>
      </div>

      <div className={styles.leaderboard}>
        <h2>Leaderboard</h2>
        <table className={styles.leaderboardTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((p, index) => (
              <tr 
                key={index} 
                // Highlight the current user
                className={p.username === profile.username ? styles.currentUser : ''}
              >
                <td>#{index + 1}</td>
                <td>{p.username}</td>
                <td>{p.accuracy.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Profile;