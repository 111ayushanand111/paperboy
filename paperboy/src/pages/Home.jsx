import { useOutletContext } from 'react-router-dom';
import PredictionCard from '../components/PredictionCard';
import styles from './Home.module.css';

function Home() {
  const { questions, loading } = useOutletContext(); // Get questions from App.jsx

  if (loading) {
    return <p className={styles.container}>Loading markets...</p>;
  }

  if (!questions || questions.length === 0) {
    return <p className={styles.container}>No active markets found.</p>;
  }

  return (
    <div className={styles.grid}>
      {questions.map((q) => (
        <PredictionCard key={q._id} question={q} />
      ))}
    </div>
  );
}

export default Home;