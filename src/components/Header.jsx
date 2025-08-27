// src/components/Header.jsx
import { FiSearch } from 'react-icons/fi';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>Paperboy</h1>
      <div className={styles.searchContainer}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search news markets"
          className={styles.searchInput}
        />
      </div>
      <div className={styles.authLinks}>
        <a href="#">Login</a>
        <a href="#">Register</a>
      </div>
    </header>
  );
};

export default Header;