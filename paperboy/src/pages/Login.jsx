import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      // ✅ Save token and username
      localStorage.setItem("token", res.data.token);
      if (res.data.username) {
        localStorage.setItem("username", res.data.username);
      }

      setMessage("✅ Logged in successfully!");

      // ✅ Redirect to homepage (or profile)
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setMessage("❌ " + msg);
    }
  };

  return (
    <div
      style={{
        color: "white",
        textAlign: "center",
        marginTop: "5rem",
        fontSize: "1.1rem",
      }}
    >
      <h2>Login</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "inline-block",
          textAlign: "left",
          background: "#111c33",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            margin: "10px",
            padding: "8px",
            width: "250px",
            borderRadius: "5px",
            border: "none",
            outline: "none",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            margin: "10px",
            padding: "8px",
            width: "250px",
            borderRadius: "5px",
            border: "none",
            outline: "none",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            style={{
              marginTop: "10px",
              padding: "8px 20px",
              cursor: "pointer",
              background: "#00b4d8",
              border: "none",
              borderRadius: "5px",
              color: "white",
              fontWeight: "600",
            }}
          >
            Login
          </button>
        </div>
      </form>
      <p style={{ marginTop: "1rem" }}>{message}</p>
    </div>
  );
}
