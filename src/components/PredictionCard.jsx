// src/components/PredictionCard.jsx
import styles from './PredictionCard.module.css';

const PredictionCard = ({ title, icon, options }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      
      <div className={styles.optionsContainer}>
        {options.map((option) => (
          <div key={option.name} className={styles.option}>
            <span className={styles.optionName}>{option.name}</span>
            <div className={styles.controls}>
              <span className={styles.percentage}>{option.percentage}%</span>
              <button className={`${styles.choiceButton} ${styles.yesButton}`}>yes</button>
              <button className={`${styles.choiceButton} ${styles.noButton}`}>no</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionCard;