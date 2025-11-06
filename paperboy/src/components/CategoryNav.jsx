import styles from './CategoryNav.module.css';

const CATEGORIES = ['for you', 'trending', 'politics', 'science', 'sports', 'tech'];

function CategoryNav({ currentCategory, onSelectCategory }) {
  
  const handleClick = (category) => {
    if (category === 'for you') {
      onSelectCategory('all');
    } else {
      onSelectCategory(category);
    }
  };

  const getActiveCategory = () => {
    if (currentCategory === 'all') return 'for you';
    return currentCategory;
  };

  return (
    <nav className={styles.nav}>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          className={category === getActiveCategory() ? styles.active : ''}
          onClick={() => handleClick(category)}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}

export default CategoryNav;