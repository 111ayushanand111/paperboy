import { useEffect, useState, useRef } from "react";
import styles from './NewsCarousel.module.css';
import axios from "axios";

export default function NewsCarousel() {
  const [news, setNews] = useState([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const isMovingRef = useRef(false);

  // Fetch latest news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          `https://newsapi.org/v2/top-headlines?country=us&pageSize=3&apiKey=cfb5ca807301489bbb3c1d3de04f6e85`
        );
        setNews(res.data.articles);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };
    fetchNews();
  }, []);

  // Automatic slide interval
  useEffect(() => {
    if (news.length === 0) return;
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [news, current]);

  // Handle manual navigation and transition debouncing
  const handleSlide = (newIndex) => {
    // Prevent multiple rapid clicks by checking if a transition is in progress
    if (isMovingRef.current) return;
    
    // Set a flag to indicate the carousel is moving
    isMovingRef.current = true;
    
    // Reset interval and move to the new slide
    startInterval();
    setCurrent(newIndex);
    
    // Reset the moving flag after the animation duration (800ms)
    setTimeout(() => {
      isMovingRef.current = false;
      // Handle the infinite loop snap back after the animation
      if (newIndex >= news.length) {
        setCurrent(0);
      }
    }, 800);
  };
  
  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      isMovingRef.current = true;
      setCurrent((prev) => {
        const nextIndex = prev + 1;
        // Snap back to 0 if at the end of the cloned items
        if (nextIndex >= news.length + 1) {
          isMovingRef.current = false; // Allow interaction immediately after the snap
          return 0;
        }
        return nextIndex;
      });
      // Allow interaction again after the transition
      setTimeout(() => {
        isMovingRef.current = false;
      }, 800);
    }, 5000);
  };
  
  const nextSlide = () => {
    handleSlide(current + 1);
  };

  const prevSlide = () => {
    // This logic now correctly accounts for infinite prev functionality
    const newIndex = (current - 1 + news.length) % news.length;
    handleSlide(newIndex);
  };

  const goToSlide = (index) => {
    handleSlide(index);
  };
  
  const handleMouseEnter = () => {
    clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    startInterval();
  };

  // Add the first news item to the end for the infinite loop effect
  const displayedNews = news.length > 0 ? [...news, news[0]] : [];

  return (
    <div 
      className={styles.carousel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {news.length > 0 ? (
        <>
          {/* Left Arrow Button */}
          <button onClick={prevSlide} className={`${styles.arrow} ${styles.arrowLeft}`}>
            &#10094;
          </button>
          
          {/* Carousel Track with all titles */}
          <div 
            className={styles.carouselTrack} 
            style={{ 
              transform: `translateX(-${current * 100}%)`,
              transition: isMovingRef.current ? 'transform 0.8s ease-in-out' : 'none'
            }}
          >
            {displayedNews.map((item, index) => (
              <h2 key={index} className={styles.title}>
                {item.title}
              </h2>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button onClick={nextSlide} className={`${styles.arrow} ${styles.arrowRight}`}>
            &#10095;
          </button>

          {/* Navigation Dots */}
          <div className={styles.dotsContainer}>
            {news.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === current % news.length ? styles.activeDot : ''}`}
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