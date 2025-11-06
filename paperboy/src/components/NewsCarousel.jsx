import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./NewsCarousel.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export default function NewsCarousel() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopHeadlines = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/top-headlines");
        const articlesWithImages = res.data.filter(
          (article) => article.urlToImage
        );
        setArticles(articlesWithImages.slice(0, 10));
      } catch (err) {
        console.error("Error fetching top headlines for carousel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopHeadlines();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
  };

  if (loading) {
    return <div className={styles.loading}>Loading Top News...</div>;
  }
  
  if (articles.length === 0) {
      return <div className={styles.loading}>No top news found.</div>
  }

  return (
    <div className={styles.carouselContainer}>
      <Slider {...settings}>
        {articles.map((article, index) => (
          <div key={index} className={styles.slide}>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.slideLink}
            >
              <img
                src={article.urlToImage}
                alt={article.title}
                className={styles.slideImage}
              />
              <div className={styles.slideContent}>
                <span className={styles.slideSource}>{article.source.name}</span>
                <h3 className={styles.slideTitle}>{article.title}</h3>
              </div>
            </a>
          </div>
        ))}
      </Slider>
    </div>
  );
}