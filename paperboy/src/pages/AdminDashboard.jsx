import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.css';
import { FaPlus, FaTimes } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard() {
  const [view, setView] = useState('resolve'); // 'resolve' or 'create'
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // State for the "Create Market" form
  const [newPoll, setNewPoll] = useState({
    title: '',
    category: 'politics',
    articleUrl: '',
    options: [{ name: 'Yes' }, { name: 'No' }],
  });

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch all polls (markets) for the admin dashboard
  const fetchAllPolls = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/admin/polls`, authHeaders);
      setPolls(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch polls. Are you an admin?');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch polls when the component mounts or view changes to 'resolve'
    if (view === 'resolve') {
      fetchAllPolls();
    }
  }, [view]);

  // --- Create Market Handlers ---
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewPoll((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = { name: value };
    setNewPoll((prev) => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    setNewPoll((prev) => ({
      ...prev,
      options: [...prev.options, { name: '' }],
    }));
  };

  const removeOption = (index) => {
    if (newPoll.options.length <= 2) {
      setFeedback('A market must have at least 2 options.');
      return;
    }
    const updatedOptions = newPoll.options.filter((_, i) => i !== index);
    setNewPoll((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFeedback('Creating market...');
    try {
      const { data } = await axios.post(
        `${API_URL}/admin/polls/create`, // Using the new admin route
        newPoll,
        authHeaders
      );
      setFeedback(`Market "${data.poll.title}" created successfully!`);
      // Reset form
      setNewPoll({
        title: '',
        category: 'politics',
        articleUrl: '',
        options: [{ name: 'Yes' }, { name: 'No' }],
      });
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Error creating market.');
    }
  };

  // --- Resolve Market Handler ---
  const handleResolve = async (pollId, winningOptionName) => {
    if (!winningOptionName) {
      alert('Please select a winning option.');
      return;
    }
    try {
      await axios.post(
        `${API_URL}/question/${pollId}/resolve`, // Using the existing resolve route
        { winningOptionName },
        authHeaders
      );
      // Refresh the poll list to show it's closed
      fetchAllPolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving market.');
    }
  };

  // --- Render Functions ---
  const renderCreateMarket = () => (
    <form onSubmit={handleCreateSubmit} className={styles.form}>
      <h2>Create New Market</h2>
      <div className={styles.inputGroup}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={newPoll.title}
          onChange={handleCreateChange}
          placeholder="Will..."
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Category</label>
        <select
          name="category"
          value={newPoll.category}
          onChange={handleCreateChange}
        >
          <option value="politics">Politics</option>
          <option value="sports">Sports</option>
          <option value="tech">Tech</option>
          <option value="science">Science</option>
          <option value="trending">Trending</option>
        </select>
      </div>
      <div className={styles.inputGroup}>
        <label>Article URL</label>
        <input
          type="url"
          name="articleUrl"
          value={newPoll.articleUrl}
          onChange={handleCreateChange}
          placeholder="https://... (Source of truth)"
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Options (2 or more)</label>
        {newPoll.options.map((option, index) => (
          <div key={index} className={styles.optionInput}>
            <input
              type="text"
              value={option.name}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
            />
            <button type="button" onClick={() => removeOption(index)} className={styles.removeBtn}>
              <FaTimes />
            </button>
          </div>
        ))}
        <button type="button" onClick={addOption} className={styles.addBtn}>
          <FaPlus /> Add Option
        </button>
      </div>
      <button type="submit" className={styles.submitBtn}>
        Create Market
      </button>
      {feedback && <p className={styles.feedback}>{feedback}</p>}
    </form>
  );

  const renderResolveMarkets = () => {
    if (loading) return <p>Loading markets...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    const openPolls = polls.filter((poll) => !poll.resolvingOptionName);
    const closedPolls = polls.filter((poll) => poll.resolvingOptionName);

    return (
      <div className={styles.resolveList}>
        <h2>Open Markets ({openPolls.length})</h2>
        {openPolls.length === 0 && <p>No open markets to resolve.</p>}
        {openPolls.map((poll) => (
          <PollResolveCard key={poll._id} poll={poll} onResolve={handleResolve} />
        ))}
        
        <h2 className={styles.divider}>Closed Markets ({closedPolls.length})</h2>
        {closedPolls.map((poll) => (
          <PollResolveCard key={poll._id} poll={poll} onResolve={handleResolve} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      <div className={styles.tabs}>
        <button
          className={view === 'resolve' ? styles.active : ''}
          onClick={() => setView('resolve')}
        >
          Resolve Markets
        </button>
        <button
          className={view === 'create' ? styles.active : ''}
          onClick={() => setView('create')}
        >
          Create Market
        </button>
      </div>
      <div className={styles.content}>
        {view === 'resolve' ? renderResolveMarkets() : renderCreateMarket()}
      </div>
    </div>
  );
}

// Helper component for the poll list
function PollResolveCard({ poll, onResolve }) {
  const [selectedWinner, setSelectedWinner] = useState(poll.options[0]?.name || '');
  const isResolved = !!poll.resolvingOptionName;

  return (
    <div className={`${styles.pollCard} ${isResolved ? styles.resolved : ''}`}>
      <div className={styles.pollInfo}>
        <span className={styles.category}>{poll.category}</span>
        <p>{poll.title}</p>
        {isResolved && (
          <p className={styles.winner}>
            Result: <strong>{poll.resolvingOptionName}</strong>
          </p>
        )}
      </div>
      {!isResolved && (
        <div className={styles.resolveControls}>
          <select
            value={selectedWinner}
            onChange={(e) => setSelectedWinner(e.target.value)}
          >
            {poll.options.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => onResolve(poll._id, selectedWinner)}
            className={styles.resolveBtn}
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;