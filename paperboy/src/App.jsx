// src/App.jsx
import './index.css';
import styles from './App.module.css';

import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import NewsCarousel from './components/NewsCarousel';
// 1. Import PredictionCard instead of PollCard
import PredictionCard from './components/PredictionCard';

import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [questions, setQuestions] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  // ✅ Fetch polls by category
  const fetchQuestions = async (category = "all") => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/questions?category=${category}`
      );
      setQuestions(res.data);
      setActiveCategory(category);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  // ✅ Load all polls initially
  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <CategoryNav onCategorySelect={fetchQuestions} activeCategory={activeCategory} />
      <NewsCarousel />

      <section className={styles.predictionsSection}>
        <h2 style={{ color: "white", margin: "20px 0" }}>🗳️ Live Polls</h2>

        {/* 2. Use the "predictionsGrid" style from your CSS file */}
        <div className={styles.predictionsGrid}>
          {questions.length > 0 ? (
            // 3. Render <PredictionCard> instead of <PollCard>
            questions.map((q) => <PredictionCard key={q._id} question={q} />)
          ) : (
            <p style={{ color: "gray", fontSize: "1.1rem" }}>
              No questions found in this category.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;