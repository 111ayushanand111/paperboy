import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link
import Header from "../components/Header"; // Optional: Add Header
import styles from "./Register.module.css"; // Import CSS Module

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous message
    setMessageType("");

    // Basic validation
    if (password.length < 6) {
        setMessage("Password must be at least 6 characters long.");
        setMessageType("error");
        return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });
      setMessage("✅ Registered successfully! Redirecting to login...");
      setMessageType("success");

      // --- Redirect after a short delay ---
      setTimeout(() => {
        navigate("/login"); // Navigate to the login page
      }, 1500); // 1.5 second delay

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      setMessage(`❌ ${errorMsg}`);
      setMessageType("error");
    }
  };

  return (
    <>
      {/* Optional: <Header /> */}
      <div className={styles.pageContainer}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Create Account</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input
                type="text"
                id="username"
                className={styles.input}
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                className={styles.input}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                className={styles.input}
                placeholder="Create a password (min. 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Display Message */}
            {message && (
              <p className={`${styles.message} ${styles[messageType]}`}>
                {message}
              </p>
            )}

            <button type="submit" className={styles.submitButton}>
              Register
            </button>
          </form>
          <p className={styles.loginLink}>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </>
  );
}