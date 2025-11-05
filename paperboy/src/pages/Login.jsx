import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css'; // Use shared styles
import { FaEnvelope, FaLock } from 'react-icons/fa'; // Import icons

const API_URL = 'http://localhost:5000/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useOutletContext(); // Get setUser from App.jsx layout

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('token', data.token);

      // Fetch user profile after login to set user state in App.jsx
      const { data: profileData } = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      setUser(profileData.user); // Set the global user state

      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className={styles.subtitle}>Please enter your details to login.</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <div className={styles.inputWrapper}>
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.authButton}>
          Login
        </button>

        <p className={styles.redirect}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;