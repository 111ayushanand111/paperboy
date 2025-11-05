import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Register.module.css'; // Shared styles
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa'; // Import icons

const API_URL = 'http://localhost:5000/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Create an Account</h2>
        <p className={styles.subtitle}>Start your gamified news journey!</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <div className={styles.inputWrapper}>
            <FaUser className={styles.inputIcon} />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Username"
              required
            />
          </div>
        </div>

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
          Create Account
        </button>

        <p className={styles.redirect}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;