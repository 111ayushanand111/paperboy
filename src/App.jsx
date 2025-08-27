// src/App.jsx
import './index.css';
import styles from './App.module.css';

import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import NewsCarousel from './components/NewsCarousel'; // This stays
import PredictionCard from './components/PredictionCard';

// The 'breakingNewsData' array has been removed.

const predictionsData = [
  {
    id: 1,
    icon: '🇮🇳',
    title: 'Next prime minister of India??',
    options: [
      { name: 'Narendra Modi', percentage: 45 },
      { name: 'Rahul Gandhi', percentage: 30 },
    ],
  },
  {
    id: 2,
    icon: '⚽',
    title: 'Who will win the 2026 FIFA World Cup?',
    options: [
      { name: 'Brazil', percentage: 22 },
      { name: 'France', percentage: 18 },
      { name: 'Argentina', percentage: 15 },
    ],
  },
  {
    id: 3,
    icon: '📱',
    title: 'Will Apple launch a foldable iPhone by 2027?',
    options: [
      { name: 'Yes, they will', percentage: 60 },
      { name: 'No, they won\'t', percentage: 40 },
    ],
  },
  {
    id: 4,
    icon: '🚀',
    title: 'Will SpaceX land humans on Mars before 2030?',
    options: [
      { name: 'Yes, before 2030', percentage: 55 },
      { name: 'No, after 2030', percentage: 45 },
    ],
  },
];


function App() {
  return (
    <div>
      <Header />
      <CategoryNav />
      <main className={styles.mainLayout}>
        {/* The carousel no longer receives any props */}
        <NewsCarousel />
        
        <div className={styles.predictionsGrid}>
          {predictionsData.map(prediction => (
            <PredictionCard
              key={prediction.id}
              title={prediction.title}
              icon={prediction.icon}
              options={prediction.options}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

export default App;