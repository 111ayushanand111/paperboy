// src/components/NewsCarousel.jsx
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './NewsCarousel.module.css';

const NewsCarousel = () => {
  return (
    <div className={styles.carousel}>
      <button className={`${styles.arrow} ${styles.arrowLeft}`}>
        <FiChevronLeft />
      </button>
      <h2 className={styles.title}>News here</h2>
      <button className={`${styles.arrow} ${styles.arrowRight}`}>
        <FiChevronRight />
      </button>
    </div>
  );
};

export default NewsCarousel;