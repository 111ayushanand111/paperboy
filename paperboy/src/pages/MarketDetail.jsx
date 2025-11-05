import { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './MarketDetail.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:5000/api';

function MarketDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [betAmount, setBetAmount] = useState('10');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [chartData, setChartData] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);

  // Get user from the App.jsx layout context
  const { user } = useOutletContext(); 
  const navigate = useNavigate();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError('');
      setFeedback('');
      
      console.log(`Fetching data for question ID: ${id}`); // For debugging
      
      const [qRes, hRes] = await Promise.all([
        axios.get(`${API_URL}/question/${id}`),
        axios.get(`${API_URL}/question/${id}/history`),
      ]);

      setQuestion(qRes.data);
      setChartData(hRes.data);
      setSelectedOption(null);

      // Fetch related news
      if (qRes.data.category) {
        try {
          const newsRes = await axios.get(
            `${API_URL}/related-news?category=${qRes.data.category}`
          );
          setRelatedNews(newsRes.data);
        } catch (newsErr) {
          console.error('Error fetching related news:', newsErr);
        }
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchMarketData();
    }
  }, [id]);

  const handleBetSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedOption) {
      setFeedback('Please select an option to bet on.');
      return;
    }
    setFeedback('Placing bet...');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/bet`, // Keep original /api/bet
        {
          questionId: id,
          selectedOptionName: selectedOption.name,
          betAmount: Number(betAmount),
          token,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeedback(
        `Successfully bet ${betAmount} points on "${
          selectedOption.name
        }". New balance: ${data.newBalance} points.`
      );
      // Refresh market data to show new prices
      fetchMarketData();
    } catch (err) {
      console.error('Error placing bet:', err);
      setFeedback(err.response?.data?.message || 'Failed to place bet.');
    }
  };

  // --- ADMIN PANEL REMOVED FROM THIS FILE ---

  if (loading) return <p>Loading market...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!question) return <p>Market not found.</p>;

  const isResolved = !!question.resolvingOptionName;

  return (
    <div className={styles.marketDetailContainer}>
      <div className={styles.marketContent}>
        <span className={styles.category}>{question.category}</span>
        <h1>{question.title}</h1>
        
        {/* Add link to the article */}
        <a href={question.articleUrl} target="_blank" rel="noopener noreferrer" className={styles.articleLink}>
          Read Full Article
        </a>
        
        {isResolved && (
          <div className={styles.resolvedBanner}>
            Market Resolved. Winning Option: {question.resolvingOptionName}
          </div>
        )}

        <div className={styles.chartContainer}>
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: {
                    ticks: { callback: (value) => `${value}¢` }, // Keep original ¢
                    min: 0,
                    max: 100,
                  },
                },
              }}
            />
          ) : (
            <p>Loading chart data...</p>
          )}
        </div>

        <form className={styles.betForm} onSubmit={handleBetSubmit}>
          <h3>Place Your Bet</h3>
          <div className={styles.optionsGrid}>
            {question.options.map((option) => (
              <button
                key={option.name}
                type="button"
                className={`${styles.optionButton} ${
                  selectedOption?.name === option.name ? styles.selected : ''
                }`}
                onClick={() => setSelectedOption(option)}
                disabled={isResolved}
              >
                <span className={styles.optionName}>{option.name}</span>
                <span className={styles.optionPrice}>{option.price}¢</span>
              </button>
            ))}
          </div>
          <div className={styles.betControls}>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              step="1"
              disabled={isResolved}
            />
            <button type="submit" disabled={!selectedOption || isResolved}>
              Bet {betAmount} Points
            </button>
          </div>
          {feedback && <p className={styles.feedback}>{feedback}</p>}
        </form>
      </div>
      <aside className={styles.sidebar}>
        <h3>Related News</h3>
        <ul className={styles.newsList}>
          {relatedNews.length > 0 ? (
            relatedNews.map((article, index) => (
              <li key={index}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.title}
                </a>
                <span>{article.source}</span>
              </li>
            ))
          ) : (
            <p>No related news found.</p>
          )}
        </ul>
      </aside>
    </div>
  );
}

export default MarketDetail;