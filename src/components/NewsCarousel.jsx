import { useEffect, useState } from "react";
import styles from './NewsCarousel.module.css';
import axios from "axios";

export default function NewsCarousel() {
  const [news, setNews] = useState([]);
  const [current, setCurrent] = useState(0);

  // Fetch latest news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=cfb5ca807301489bbb3c1d3de04f6e85`
        );
        setNews(res.data.articles);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };
    fetchNews();
  }, []);
  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % news.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [news]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + news.length) % news.length);
  };

  return (
    <div className={styles.carousel}>
      {news.length > 0 ? (
        <>
          <button onClick={prevSlide} className={`${styles.arrow} ${styles.arrowLeft}`}>
            &#10094;
          </button>
          <div className={styles.titleContainer}> {/* New container for the title */}
            <h2 className={styles.title}>{news[current].title}</h2>
          </div>
          <button onClick={nextSlide} className={`${styles.arrow} ${styles.arrowRight}`}>
            &#10095;
          </button>
        </>
      ) : (
        <h2 className={styles.title}>Loading News...</h2>
      )}
    </div>
  );
}