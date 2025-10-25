import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import styles from "./MarketDetail.module.css";

// Chart.js imports
// --- REMOVED TimeScale ---
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
// --- REMOVED TimeScale from registration ---
ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );


export default function MarketDetail() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [betStatus, setBetStatus] = useState({ message: "", type: "" });
  const [relatedNews, setRelatedNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loadingChart, setLoadingChart] = useState(true);
  
  const { questionId } = useParams();

  // Function to fetch only the chart history
  const fetchChartData = async () => {
    try {
      console.log("Fetching chart history...");
      setLoadingChart(true);
      const res = await axios.get(`http://localhost:5000/api/question/${questionId}/history`);
      if (res.data.labels && res.data.datasets) {
        setChartData(res.data);
        console.log("Chart data fetched.", res.data);
      } else {
        setChartData({ labels: [], datasets: [] });
      }
    } catch (err) {
      console.error("Error fetching chart history:", err);
      setChartData({ labels: [], datasets: [] });
    } finally {
      setLoadingChart(false);
    }
  };

  // Function to fetch only the question data (for price updates)
  const fetchQuestionDataOnly = async () => {
    try {
        console.log("Refetching question data after bet...");
        const res = await axios.get(`http://localhost:5000/api/question/${questionId}`);
        setQuestion(res.data);
         console.log("Question data refetched.", res.data);
    } catch (err) {
        console.error("Error refetching question data:", err);
    }
  };

  // Fetch Initial Question, News, and Chart Data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true); setLoadingNews(true);
        const resQuestion = await axios.get(`http://localhost:5000/api/question/${questionId}`);
        const fetchedQuestion = resQuestion.data;
        setQuestion(fetchedQuestion);
        
        if (fetchedQuestion?.title) {
          // Fetch news
          try {
            const searchQuery = fetchedQuestion.title.replace(/\?$/, "");
            const resNews = await axios.get(`http://localhost:5000/api/related-news?q=${encodeURIComponent(searchQuery)}`);
            setRelatedNews(resNews.data);
          } catch (newsErr) { console.error("Error fetching related news:", newsErr); setRelatedNews([]); }
          finally { setLoadingNews(false); }
          
          // Fetch initial chart data
          await fetchChartData(); 
            
        } else { 
            setLoadingNews(false);
            setLoadingChart(false);
        }
      } catch (err) { 
          console.error("Error fetching question details:", err); 
          setLoadingNews(false);
          setLoadingChart(false);
      }
      finally { setLoading(false); }
    };
    fetchAllData();
  }, [questionId]);

  // Function to Handle Bet Submission
  const handleBetSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!selectedOption) {
      setBetStatus({ message: "Please select an option to bet on.", type: "error" }); return;
    }
    const amount = Number(betAmount);
    if (isNaN(amount) || amount < 1) {
      setBetStatus({ message: "Please enter a valid bet amount (minimum 1).", type: "error" }); return;
    }
    if (!token) {
        setBetStatus({ message: "You must be logged in to place a bet.", type: "error" }); return;
    }
    setBetStatus({ message: "Placing bet...", type: "loading" });
    try {
      const response = await axios.post("http://localhost:5000/api/bet", {
        questionId: question._id,
        selectedOptionName: selectedOption,
        betAmount: amount,
        token: token,
      });
      setBetStatus({ message: "Bet placed successfully!", type: "success" });
      console.log("Bet response:", response.data);

      if (response.data.newBalance !== undefined) {
        console.log("[MarketDetail] Updating localStorage with points:", response.data.newBalance);
        localStorage.setItem("userPoints", response.data.newBalance.toString());
        console.log("[MarketDetail] Dispatching pointsUpdated event");
        window.dispatchEvent(new Event('pointsUpdated'));
      }

      // Refetch BOTH question data (for prices) AND chart data
      await Promise.all([
          fetchQuestionDataOnly(),
          fetchChartData()
      ]);

      setSelectedOption(null);
      setBetAmount("");
      setTimeout(() => setBetStatus({ message: "", type: "" }), 2000);

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to place bet. Please try again.";
      setBetStatus({ message: errorMessage, type: "error" });
      console.error("Betting error:", error.response || error);
    }
  };

  // Loading/Not Found states
  if (loading) return <div className={styles.loading}>Loading Market Details...</div>;
  if (!question) return <div className={styles.loading}>Market not found or failed to load.</div>;

  // --- Define variables *after* loading checks ---
  
  // Chart.js options
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { 
        legend: { position: "top", labels: { color: "white" } },
        tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) { label += context.parsed.y + '¢'; }
                    return label;
                }
            }
        }
    },
    scales: { 
      x: { 
        // --- REVERTED to default 'category' scale ---
        // type: 'time', // This line caused the crash
        ticks: { color: "white" }, 
        grid: { color: "rgba(255, 255, 255, 0.1)" } 
      }, 
      y: { 
        ticks: { color: "white", callback: (value) => `${value}¢` },
        grid: { color: "rgba(255, 255, 255, 0.1)" }, 
        min: 0, 
        max: 100 
      }, 
    },
    hover: {
        mode: 'index',
        intersect: false
    },
  };
  
  const isYesNoMarket = question.options.length === 2 && question.options.some((o) => o.name.toLowerCase() === "yes") && question.options.some((o) => o.name.toLowerCase() === "no");
  const yesOption = isYesNoMarket ? question.options.find(o => o.name.toLowerCase() === 'yes') : null;
  const noOption = isYesNoMarket ? question.options.find(o => o.name.toLowerCase() === 'no') : null;

  // Render the component
  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        <h1 className={styles.title}>{question.title}</h1>
        <p className={styles.category}>Category: {question.category}</p>

        {/* Graph and Voting Panel */}
        <div className={styles.mainContent}>
          <div className={styles.graphContainer}>
            {loadingChart ? (
                <div className={styles.loadingChart}>Loading chart...</div>
            ) : chartData.datasets.length > 0 && chartData.labels.length > 0 ? (
                <Line options={chartOptions} data={chartData} />
            ) : (
                <div className={styles.loadingChart}>No price history available.</div>
            )}
          </div>
          <div className={styles.tradeContainer}>
            <h3 className={styles.tradeTitle}>Place Your Bet</h3>

            {/* Option Selection Buttons */}
            {isYesNoMarket && yesOption && noOption ? (
              <div className={styles.yesNoContainer}>
                <button
                  className={`${styles.yesButton} ${selectedOption === yesOption.name ? styles.selected : ''}`}
                  onClick={() => setSelectedOption(yesOption.name)}
                >
                  Yes {question.options.find(o => o.name === yesOption.name)?.price ?? yesOption.price}¢
                </button>
                <button
                  className={`${styles.noButton} ${selectedOption === noOption.name ? styles.selected : ''}`}
                  onClick={() => setSelectedOption(noOption.name)}
                >
                  No {question.options.find(o => o.name === noOption.name)?.price ?? noOption.price}¢
                </button>
              </div>
            ) : (
              <div className={styles.multiOptionContainer}>
                {question.options.map((opt) => (
                  <button
                    key={opt.name}
                    className={`${styles.optionButton} ${selectedOption === opt.name ? styles.selected : ''}`}
                    onClick={() => setSelectedOption(opt.name)}
                  >
                    <span>{opt.name}</span>
                    <span>{opt.price}¢</span>
                  </button>
                ))}
              </div>
            )}

            {/* Bet Amount Input */}
            <div className={styles.betAmountContainer}>
              <label htmlFor="betAmountInput" className={styles.betAmountLabel}>Bet Amount (Points):</label>
              <input type="number" id="betAmountInput" className={styles.betAmountInput} value={betAmount} onChange={(e) => setBetAmount(e.target.value)} placeholder="Enter points" min="1"/>
            </div>

            {/* Bet Status Feedback */}
            {betStatus.message && ( <p className={`${styles.betStatus} ${styles[betStatus.type]}`}> {betStatus.message} </p> )}

            {/* Submit Bet Button */}
            <button className={styles.tradeButton} onClick={handleBetSubmit} disabled={betStatus.type === 'loading'}>
              {betStatus.type === 'loading' ? 'Submitting...' : 'Submit Bet'}
            </button>
          </div>
        </div>

        {/* News and Rules Section */}
        <div className={styles.infoContainer}>
            {/* Relevant News */}
             <div className={styles.news}>
               <h3>Relevant News</h3>
               {loadingNews ? ( <p className={styles.newsLoading}>Loading news...</p> ) :
                relatedNews.length > 0 ? ( <ul className={styles.newsList}> {relatedNews.slice(0, 10).map((article, index) => ( <li key={index} className={styles.newsItem}> <a href={article.url} target="_blank" rel="noreferrer" className={styles.newsItemLink}> <span className={styles.newsSource}>{article.source}</span> <span className={styles.newsTitle}>{article.title}</span> </a> </li> ))} </ul> ) :
                ( <p className={styles.newsNotFound}>No related news articles found.</p> )}
               <a href={`https://www.google.com/search?q=${encodeURIComponent(question.title.replace(/\?$/, ""))}`} target="_blank" rel="noreferrer" className={styles.newsLink} style={{ marginTop: '1.5rem' }}> Search for this topic on Google </a>
             </div>
             {/* Rules Summary */}
             <div className={styles.rules}>
               <h3>Rules Summary</h3>
               <p> This market will resolve based on the outcome reported by the source article or official announcements. </p>
               <a href={question.articleUrl} target="_blank" rel="noreferrer" className={styles.newsLink}> Read Source Article (Resolves market) </a>
             </div>
        </div>
      </div>
    </>
  );
} // End of component