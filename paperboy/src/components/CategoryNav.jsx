// src/components/CategoryNav.jsx
import styles from "./CategoryNav.module.css";

const categories = [
  { key: "all", label: "For you" },
  { key: "trending", label: "Trending" },
  { key: "politics", label: "Politics" },
  { key: "science", label: "Science" },
  { key: "sports", label: "Sports" },
  { key: "technology", label: "Tech" },
];

export default function CategoryNav({ onCategorySelect, activeCategory }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.categories}>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategorySelect(cat.key)}
            className={`${styles.categoryButton} ${
              activeCategory === cat.key ? styles.active : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
