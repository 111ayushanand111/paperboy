// src/components/CategoryNav.jsx
import styles from './CategoryNav.module.css';

const categories = ['For you', 'Trending', 'Politics', 'Science', 'Sports', 'Tech'];

const CategoryNav = () => {
  return (
    <nav className={styles.nav}>
      {categories.map((category) => (
        <button key={category} className={styles.categoryButton}>
          {category}
        </button>
      ))}
    </nav>
  );
};

export default CategoryNav;