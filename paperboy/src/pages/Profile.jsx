import { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext, Link } from 'react-router-dom';
import styles from './Profile.module.css';

const API_URL = 'http://localhost:5000/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [betStats, setBetStats] = useState({ total: 0, correct: 0, resolved: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [betHistory, setBetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { setUser } = useOutletContext();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }
      
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      try {
        setLoading(true); 
        const [profileRes, betsRes] = await Promise.all([
          axios.get(`${API_URL}/profile`, authHeaders),
          axios.get(`${API_URL}/profile/bets`, authHeaders)
        ]);

        const profileData = profileRes.data;

        setProfile(profileData.user);
        setLeaderboard(profileData.leaderboard);
        
        setBetHistory(betsRes.data.betHistory);
        setBetStats(betsRes.data.betStats);
        
        if (setUser) {
          setUser(profileData.user);
        }

      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to fetch profile.');
        localStorage.removeItem('token'); 
        if (setUser) {
          setUser(null); 
        }
      }
      setLoading(false); 
    };

    fetchProfileData();
  }, [setUser]); 

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  const accuracy =
    betStats.resolved > 0 ? (betStats.correct / betStats.resolved) * 100 : 0;
  
  const userRank = leaderboard.findIndex(p => p.username === profile.username) + 1;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>{profile.username}'s Profile</h1>
        <div className={styles.headerDetails}>
          <p>Email: {profile.email}</p>
          <p>Points: {profile.points}</p>
          <p>Your Rank: #{userRank > 0 ? userRank : 'N/A'}</p>
        </div>
      </div>

      {/* --- STATS SECTION RE-IMPLEMENTED --- */}
      <div className={styles.statsContainer}>
        <h2>Your Prediction Stats</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Predictions Placed</h3>
            <p>{betStats.total}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Correct Predictions</h3>
            <p>{betStats.correct}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Resolved Predictions</h3>
            <p>{betStats.resolved}</p>
          </div>
        </div>
        <div className={styles.accuracy}>
          <h3>Prediction Accuracy</h3>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
          <p>{accuracy.toFixed(2)}%</p>
        </div>
      </div>
      {/* --- END STATS SECTION --- */}


      <div className={styles.columns}>
        <div className={styles.leaderboard}>
          <h2>Leaderboard</h2>
          <table className={styles.leaderboardTable}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((p, index) => (
                <tr 
                  key={index} 
                  className={p.username === profile.username ? styles.currentUser : ''}
                >
                  <td>#{index + 1}</td>
                  <td>{p.username}</td>
                  <td>{p.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.betHistory}>
          <h2>Prediction History</h2>
          <div className={styles.betList}>
            {betHistory.length === 0 && <p>You haven't placed any Predictions yet.</p>}
            {betHistory.map(bet => {
              const market = bet.questionId;
              if (!market) return null; 
              
              const isResolved = !!market.resolvingOptionName;
              let result = 'pending';
              let payout = 0;
              if (isResolved) {
                if (bet.selectedOptionName === market.resolvingOptionName) {
                  result = 'correct';
                  payout = Math.floor((100 / bet.priceAtBet) * bet.betAmount);
                } else {
                  result = 'incorrect';
                }
              }

              return (
                <div key={bet._id} className={styles.betCard}>
                  <Link to={`/market/${market._id}`} className={styles.betTitle}>
                    {market.title}
                  </Link>
                  <p>You bet <strong>{bet.betAmount}</strong> points on <strong>"{bet.selectedOptionName}"</strong></p>
                  <div className={`${styles.betResult} ${styles[result]}`}>
                    {result === 'correct' && `Correct (+${payout} points)`}
                    {result === 'incorrect' && 'Incorrect'}
                    {result === 'pending' && 'Market is still open'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;