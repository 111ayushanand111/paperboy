import { useState } from "react";
import axios from "axios";

export default function PollCard({ question }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const handleVote = async (opt) => {
    try {
      setSelected(opt);
     const token = localStorage.getItem("token");
const res = await axios.post("http://localhost:5000/api/answer", {
  id: question._id,
  selected: opt,
  token,
});

      setResult(res.data);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  return (
    <div
      className="poll-card"
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "20px",
        color: "white",
        margin: "12px auto",
        width: "90%",
        maxWidth: "650px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      }}
    >
      <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
        🗳️ {question.title}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {question.options.map((o) => (
          <button
            key={o.name}
            onClick={() => handleVote(o.name)}
            disabled={!!selected}
            style={{
              background:
                selected === o.name
                  ? o.isCorrect
                    ? "#16a34a"
                    : "#dc2626"
                  : "#1e293b",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: selected ? "not-allowed" : "pointer",
              fontSize: "1rem",
              textAlign: "left",
              transition: "all 0.3s ease",
            }}
          >
            {o.name}
          </button>
        ))}
      </div>

      {result && (
        <div style={{ marginTop: "12px" }}>
          <p
            style={{
              color: result.correct ? "#4ade80" : "#f87171",
              fontWeight: "500",
            }}
          >
            {result.correct ? "✅ Correct!" : "❌ Wrong!"}
          </p>
          <a
            href={result.link}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Read full article →
          </a>
        </div>
      )}
    </div>
  );
}
