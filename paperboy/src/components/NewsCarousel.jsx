import { useEffect, useState, useRef } from "react";
import styles from "./NewsCarousel.module.css";
import axios from "axios";

export default function NewsCarousel() {
  const [news, setNews] = useState([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const isAnimating = useRef(false);

  // ✅ Fetch dynamic headlines from backend (latest questions)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/questions");
        setNews(res.data.slice(0, 10)); // top 10
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };
    fetchNews();
  }, []);

  // ✅ Auto-slide every 5s
  useEffect(() => {
    if (news.length === 0) return;
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [news, current]);

  const startAutoSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => nextSlide(), 5000);
  };

  const nextSlide = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setCurrent((prev) => (prev + 1) % news.length);
    setTimeout(() => (isAnimating.current = false), 800);
  };

  const prevSlide = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setCurrent((prev) => (prev - 1 + news.length) % news.length);
    setTimeout(() => (isAnimating.current = false), 800);
  };

  const goToSlide = (index) => {
    if (!isAnimating.current) setCurrent(index);
  };

  const handleMouseEnter = () => clearInterval(intervalRef.current);
  const handleMouseLeave = () => startAutoSlide();

  return (
    <div
      className={styles.carousel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {news.length > 0 ? (
        <>
          {/* Left arrow */}
          <button onClick={prevSlide} className={styles.arrow}>
            &#10094;
          </button>

          {/* ✅ Use transform for smooth movement */}
          <div
            className={styles.carouselTrack}
            style={{
              transform: `translateX(-${current * 100}%)`,
              transition: "transform 0.8s ease-in-out",
            }}
          >
            {news.map((item, index) => (
              <h2 key={index} className={styles.title}>
                {item.title?.replace(/\?$/, "")}
              </h2>
            ))}
          </div>

          {/* Right arrow */}
          <button onClick={nextSlide} className={styles.arrow}>
            &#10095;
          </button>

          {/* Dots */}
          <div className={styles.dotsContainer}>
            {news.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${
                  index === current ? styles.activeDot : ""
                }`}
                onClick={() => goToSlide(index)}
              ></span>
            ))}
          </div>
        </>
      ) : (
        <h2 className={styles.title}>Loading News...</h2>
      )}
    </div>
  );
}
