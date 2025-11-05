import styles from './CategoryNav.module.css';

const CATEGORIES = ['for you', 'trending', 'politics', 'science', 'sports', 'tech'];

function CategoryNav({ currentCategory, onSelectCategory }) {
  
  // This function translates the button text ("for you") 
  // into the API parameter the server expects ("all").
  const handleClick = (category) => {
    if (category === 'for you') {
      onSelectCategory('all');
    } else {
      onSelectCategory(category);
    }
  };

  // This function highlights the correct button.
  // It maps the "all" state back to the "for you" button.
  const getActiveCategory = () => {
    if (currentCategory === 'all') return 'for you';
    return currentCategory;
  };

  return (
    <nav className={styles.nav}>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          // Use the new getActiveCategory() to check for active state
          className={category === getActiveCategory() ? styles.active : ''}
          // Use the new handleClick function
          onClick={() => handleClick(category)}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}

export default CategoryNav;