// src/components/PredictionCard.jsx
import { useEffect, useState } from 'react';
import styles from './PredictionCard.module.css';
import { Link } from 'react-router-dom'; // 1. Import Link

const PredictionCard = ({ question }) => {
  const [percentages, setPercentages] = useState({});

  // We keep this to show the percentages on the grid card
  useEffect(() => {
    const generateFakePercentages = () => {
      let total = 100;
      const newPercentages = {};

      question.options.forEach((option, index) => {
        if (index === question.options.length - 1) {
          newPercentages[option.name] = total;
        } else {
          const randomPercent = Math.floor(Math.random() * (total / 2));
          newPercentages[option.name] = randomPercent;
          total -= randomPercent;
        }
      });

      const shuffledPercentages = {};
      const keys = Object.keys(newPercentages);
      keys.sort(() => 0.5 - Math.random());
      keys.forEach(key => {
        shuffledPercentages[key] = newPercentages[keys.find(k => k === key)];
      });
      
      setPercentages(newPercentages);
    };

    generateFakePercentages();
  }, [question]);

  return (
    // 2. Wrap the entire card in a Link component
    <Link to={`/market/${question._id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>{question.title}</h3>
        </div>
        
        <div className={styles.optionsContainer}>
          {question.options.map((option) => (
            <div key={option.name} className={styles.option}>
              <span className={styles.optionName}>{option.name}</span>
              <div className={styles.controls}>
                <span className={styles.percentage}>
                  {percentages[option.name] || 0}%
                </span>
                {/* 3. Remove the Yes/No buttons */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default PredictionCard;