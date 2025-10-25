const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Question = require("./models/question");
const { generateNewsPolls } = require("./newsPollGenerator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const UserStats = require("./models/UserStats");
const Bet = require("./models/Bet"); // <-- Import the new Bet model
const axios = require("axios");

const JWT_SECRET = "paperboy_secret"; // ideally from process.env


dotenv.config();

// Logging environment variables
console.log("✅ Loaded NEWS_API_KEY:", process.env.NEWS_API_KEY ? "Set" : "Not Set!");
console.log("✅ Loaded HF_TOKEN:", process.env.HF_TOKEN ? "Set" : "Not Set!"); // Check HF token if still used

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/paperboy", {
    // useNewUrlParser: true, // Deprecated options removed
    // useUnifiedTopology: true, // Deprecated options removed
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --- Existing Routes ---

app.get("/", (req, res) => res.send("Backend running..."));

// Get all polls
app.get("/api/questions", async (req, res) => {
  try {
    const category = req.query.category?.toLowerCase() || "all";
    let data;

    if (category === "all") {
      data = await Question.aggregate([{ $sample: { size: 10 } }]);
    } else if (category === "trending") {
      const all = await Question.find();
      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
      }
      data = all.slice(0, 10);
    } else {
      data = await Question.find({ category });
    }
    res.json(data);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// Get ONE poll by its ID
app.get("/api/question/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (err) {
    console.error("Error fetching single question:", err);
    res.status(500).json({ message: "Error fetching question" });
  }
});

// Submit vote (Keep this for now, maybe refactor later?)
app.post("/api/answer", async (req, res) => {
  try {
    const { id, selected, token } = req.body;
    const q = await Question.findById(id);
    if (!q) return res.status(404).json({ message: "Question not found" });

    // Assuming isCorrect might still exist on older questions or for a different mode
    const correct = q.options.find((o) => o.name === selected)?.isCorrect || false;

    if (token) {
      // UserStats update logic... (keep as is for now)
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      let stats = await UserStats.findOne({ userId });
      if (!stats) {
        stats = await UserStats.create({ userId, attempted: 0, correct: 0 });
      }
      stats.attempted += 1;
      if (correct) stats.correct += 1;
      await stats.save();
    }
    res.json({ correct, link: q.articleUrl });
  } catch (err) {
    console.error("Error updating stats:", err);
    res.status(500).json({ message: "Error recording answer" });
  }
});

// Manual Add route
app.get("/api/add", async (req, res) => {
  try {
    const newQuestion = {
      title: "Who will win the Pro Football Championship?",
      options: [
        { name: "Kansas City", price: 35 }, { name: "Buffalo", price: 28 },
        { name: "Detroit", price: 18 }, { name: "Other", price: 19 },
      ],
      articleUrl: "https://www.nfl.com/championship", category: "sports", resolvingOptionName: null,
    };
    const existing = await Question.findOne({ title: newQuestion.title });
    if (existing) return res.send("✅ Test question already exists.");
    await Question.create(newQuestion);
    res.send("✅ Manually added 'Pro Football' test question.");
  } catch (err) {
    console.error("Error adding manual question:", err.message);
    res.status(500).send("Error adding question");
  }
});

// Generate News route
app.get("/api/generate-news", async (req, res) => {
  try {
    await generateNewsPolls();
    res.send("✅ Generated new polls from live news");
  } catch (err) {
    console.error("❌ Error in /api/generate-news:", err);
    res.status(500).send("Error generating news polls");
  }
});

// Search News route
app.get("/api/search-news", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Missing query" });
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=10&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`;
    const { data } = await axios.get(url);
    const results = data.articles.map((article) => ({
      title: article.title, url: article.url, source: article.source.name,
    }));
    res.json(results);
  } catch (err) {
    console.error("Error fetching search results:", err.message);
    res.status(500).json({ message: "Error fetching search results" });
  }
});

// Related News route
app.get("/api/related-news", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ message: "Missing search query (q)" });
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=10&sortBy=relevancy&apiKey=${process.env.NEWS_API_KEY}`;
        console.log(`🔍 Searching related news for: "${query}"`);
        const { data } = await axios.get(url);
        const results = data.articles.map((article) => ({
            title: article.title, url: article.url, source: article.source.name,
        })).slice(0, 10);
        res.json(results);
    } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message;
        console.error(`Error fetching related news (Status: ${status || 'N/A'}):`, message);
        res.status(status || 500).json({ message: "Error fetching related news articles" });
    }
});

// Register route
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashed });
    res.json({ message: "✅ User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Profile route
// Inside server/index.js
app.get("/api/profile", async (req, res) => {
  try { // <-- Error likely occurs within this block
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET); // Possible error point 1
    const user = await User.findById(decoded.id).select("-password"); // Possible error point 2
    if (!user) return res.status(404).json({ message: "User not found" });

    const statsDoc = await UserStats.findOne({ userId: user._id }); // Possible error point 3
    const stats = { attempted: statsDoc?.attempted || 0, correct: statsDoc?.correct || 0 };

    const allStats = await UserStats.find().populate("userId", "username"); // Possible error point 4
    const leaderboard = allStats.map((s) => ({
      // Ensure s.userId is not null before accessing username
      username: s.userId ? s.userId.username : 'Unknown User',
      accuracy: s.attempted > 0 ? (s.correct / s.attempted) * 100 : 0,
    })).sort((a, b) => b.accuracy - a.accuracy);

    const userRank = leaderboard.findIndex((p) => p.username === user.username) + 1;

    res.json({ user, stats, leaderboard, userRank });
  } catch (err) { // <-- The specific error gets caught here
    // This is the message logged on the SERVER console
    console.error("❌ Error loading profile:", err.message, err.stack); // Added err.stack for more detail
    res.status(500).json({ message: "Error loading profile" }); // This is sent to the browser
  }
});

// --- Simple Placeholder Market Maker Logic ---
// --- Updated Placeholder Market Maker Logic ---
async function updateMarketPrices(questionId, boughtOptionName, betAmount) {
  try {
    const question = await Question.findById(questionId);
    if (!question || question.resolvingOptionName) {
      return;
    }

    const options = question.options;
    const numOptions = options.length;
    if (numOptions < 2) return;

    const boughtOption = options.find(opt => opt.name === boughtOptionName);
    if (!boughtOption) return;

    // --- Basic Price Adjustment (same as before) ---
    const priceIncrease = Math.min(5, Math.max(1, Math.floor(betAmount / 20)));
    let newBoughtPrice = Math.min(99, boughtOption.price + priceIncrease);
    const actualIncrease = newBoughtPrice - boughtOption.price;

    let totalOtherPrice = 100 - boughtOption.price;
    let decreaseDistributed = 0;

    options.forEach(opt => {
      if (opt.name !== boughtOptionName && totalOtherPrice > 0) {
        let decrease = Math.round(actualIncrease * (opt.price / totalOtherPrice));
        opt.price = Math.max(1, opt.price - decrease);
        decreaseDistributed += decrease;
      }
    });

    boughtOption.price = newBoughtPrice;

    // --- Re-normalize prices (same as before) ---
    let currentSum = options.reduce((sum, opt) => sum + opt.price, 0);
    let difference = 100 - currentSum;

    if (difference !== 0) {
      let adjustOption = options.find(opt => opt.name !== boughtOptionName && opt.price > 1 && opt.price < 99);
      if (!adjustOption) {
          adjustOption = boughtOption;
      }
      adjustOption.price = Math.max(1, Math.min(99, adjustOption.price + difference));
    }
    
    currentSum = options.reduce((sum, opt) => sum + opt.price, 0);
    if (currentSum !== 100 && options.length > 0) {
         // Force the first option (or any option) to absorb the final rounding error
         options[0].price = Math.max(1, Math.min(99, options[0].price + (100 - currentSum)));
    }
    // --- End Re-normalization ---


    // --- NEW: Add the new prices to the history ---
    question.priceHistory.push({
      prices: question.options.map(opt => ({ name: opt.name, price: opt.price }))
      // Timestamp will be added by default
    });
    // ---

    // Mark options as modified
    question.markModified('options');
    question.markModified('priceHistory'); // Mark history as modified
    await question.save(); // Save everything in one go

    console.log(`Prices updated for question ${questionId}. New prices:`, question.options.map(o => `${o.name}: ${o.price}¢`).join(', '));

  } catch (error) {
    console.error(`❌ Error updating market prices for question ${questionId}:`, error.message);
  }
}
// --- End Updated Market Maker ---
// --- End Placeholder Market Maker ---

// --- NEW ROUTE: Handle Bet Placement ---
// --- Updated /api/bet Route ---
app.post("/api/bet", async (req, res) => {
  try {
    const { questionId, selectedOptionName, betAmount, token } = req.body;

    // 1. Validate Input (unchanged)
    if (!questionId || !selectedOptionName || !betAmount || !token) {
      return res.status(400).json({ message: "Missing required bet information or token" });
    }
    const amount = Number(betAmount);
    if (isNaN(amount) || amount < 1) {
      return res.status(400).json({ message: "Invalid bet amount" });
    }

    // 2. Verify User Token (unchanged)
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (authError) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const userId = decoded.id;

    // --- 3. Fetch User and Question ---
    // Use Promise.all to fetch both concurrently for efficiency
    const [user, question] = await Promise.all([
        User.findById(userId),
        Question.findById(questionId)
    ]);

    // --- 4. Validate User and Question Existence ---
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    if (question.resolvingOptionName) {
        return res.status(400).json({ message: "Market has already resolved" });
    }
    const selectedOption = question.options.find(opt => opt.name === selectedOptionName);
    if (!selectedOption) {
      return res.status(400).json({ message: "Selected option not found" });
    }

    // --- 5. Check User Balance ---
    if (user.points < amount) {
      return res.status(400).json({ message: `Insufficient points. You have ${user.points} points.` });
    }
    // ---

    // 6. Get price at bet (unchanged)
    const priceAtBet = selectedOption.price;

    // --- 7. Deduct Points from User ---
    user.points -= amount;
    // ---

    // 8. Create the Bet (unchanged)
    const newBet = new Bet({
      userId, questionId, selectedOptionName, betAmount: amount, priceAtBet,
    });

    // --- 9. Save User and Bet (IMPORTANT: Save both) ---
    // Use Promise.all to save concurrently
    await Promise.all([
        user.save(),
        newBet.save()
    ]);
    // ---

    // 10. TODO: Update option prices based on the bet (market maker logic)
    await updateMarketPrices(questionId, selectedOptionName, amount);

    console.log(`Bet placed: User ${userId} bet ${amount} on "${selectedOptionName}". New balance: ${user.points}`);

    // Send back success message and maybe the new balance
    res.status(201).json({ message: "Bet placed successfully", bet: newBet, newBalance: user.points });

  } catch (err) {
    console.error("❌ Error placing bet:", err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Bet validation failed", details: err.errors });
    }
    res.status(500).json({ message: "Failed to place bet" });
  }
});
// --- End Updated /api/bet Route ---
// --- NEW ROUTE: Get Price History for Graph ---
app.get("/api/question/:id/history", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
                                   .select("options priceHistory"); // Only select fields we need
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // --- Format data for Chart.js ---
    // 1. Create labels (timestamps)
    // Format timestamps to be more readable (e.g., "Oct 25, 9:40 PM")
    const labels = question.priceHistory.map(entry => {
        return new Date(entry.timestamp).toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    });

    // 2. Create datasets (one for each option)
    const datasets = question.options.map(option => {
        const colors = {"Yes": "#34d399", "No": "#f87171"}; // Simple colors for Yes/No
        const defaultColors = ["#34d399", "#60a5fa", "#f87171", "#c084fc"];

        // Find the price for this option in each history entry
        const data = question.priceHistory.map(entry => {
            const priceEntry = entry.prices.find(p => p.name === option.name);
            return priceEntry ? priceEntry.price : null; // Use null for missing data
        });

        // Pick a color
        const color = colors[option.name] || defaultColors[question.options.indexOf(option) % defaultColors.length];

        return {
            label: option.name, // "Yes", "No", "Candidate A", etc.
            data: data,
            borderColor: color,
            backgroundColor: color + '33', // Lighter color for area fill (optional)
            fill: false, // Don't fill under the line
            tension: 0.1 // Make the line slightly curved
        };
    });

    res.json({ labels, datasets });
    // --- End Format Data ---

  } catch (err) {
    console.error(`❌ Error fetching price history for ${req.params.id}:`, err.message);
    res.status(500).json({ message: "Failed to fetch price history" });
  }
});
// --- END NEW ROUTE ---

// Start the server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));