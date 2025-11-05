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
const Bet = require("./models/Bet");
const axios = require("axios");

const JWT_SECRET = "paperboy_secret"; // ideally from process.env

dotenv.config();

// Logging environment variables
console.log("✅ Loaded NEWS_API_KEY:", process.env.NEWS_API_KEY ? "Set" : "Not Set!");
console.log("✅ Loaded HF_TOKEN:", process.env.HF_TOKEN ? "Set" : "Not Set!");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/paperboy", {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// --- Routes ---

app.get("/", (req, res) => res.send("Backend running..."));

// --- NEW ROUTE: For News Carousel ---
app.get("/api/top-headlines", async (req, res) => {
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
    console.log(`🔍 Fetching top headlines for carousel...`);
    const { data } = await axios.get(url);

    // Just send the raw articles
    res.json(data.articles || []);

  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;
    console.error(`Error fetching top headlines (Status: ${status || 'N/A'}):`, message);
    res.status(status || 500).json({ message: "Error fetching top headlines" });
  }
});
// ---

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

// Get Price History for Graph
app.get("/api/question/:id/history", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
                                   .select("options priceHistory");
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    const labels = question.priceHistory.map(entry => {
        return new Date(entry.timestamp).toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    });
    const datasets = question.options.map((option, index) => {
        const colors = {"Yes": "#34d399", "No": "#f87171"};
        const defaultColors = ["#34d399", "#60a5fa", "#f87171", "#c084fc"];
        const data = question.priceHistory.map(entry => {
            const priceEntry = entry.prices.find(p => p.name === option.name);
            return priceEntry ? priceEntry.price : null;
        });
        const color = colors[option.name] || defaultColors[index % defaultColors.length];
        return {
            label: option.name,
            data: data,
            borderColor: color,
            backgroundColor: color + '33',
            fill: false,
            tension: 0.1
        };
    });
    res.json({ labels, datasets });
  } catch (err) {
    console.error(`❌ Error fetching price history for ${req.params.id}:`, err.message);
    res.status(500).json({ message: "Failed to fetch price history" });
  }
});

// Submit vote (Quiz Mode - DEPRECATED but kept for now)
app.post("/api/answer", async (req, res) => {
  try {
    const { id, selected, token } = req.body;
    const q = await Question.findById(id);
    if (!q) return res.status(404).json({ message: "Question not found" });

    const correct = q.options.find((o) => o.name === selected)?.isCorrect || false;

    if (token) {
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

// --- FIXED: Search News route ---
app.get("/api/search-news", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Missing query" });

    const url = `https://newsapi.org/v2/top-headlines?country=us&q=${encodeURIComponent(
      query
    )}&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
    
    console.log(`🔍 Searching top headlines for: "${query}"`);
    const { data } = await axios.get(url);

    const results = data.articles.map((article) => ({
      title: article.title,
      url: article.url,
      source: article.source.name,
    }));

    res.json(results);
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;
    console.error(`Error fetching search results (Status: ${status || 'N/A'}):`, message);
    res.status(status || 500).json({ message: "Error fetching search results" });
  }
});
// ---

// Related News route (for MarketDetail page)
app.get("/api/related-news", async (req, res) => {
    try {
        const category = req.query.category?.toLowerCase();
        if (!category) {
          return res.status(400).json({ message: "Missing category query" });
        }
        
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${encodeURIComponent(
          category
        )}&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;

        console.log(`🔍 Searching top headlines for category: "${category}"`);
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
app.get("/api/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const statsDoc = await UserStats.findOne({ userId: user._id });
    const stats = { attempted: statsDoc?.attempted || 0, correct: statsDoc?.correct || 0 };

    const allStats = await UserStats.find().populate("userId", "username");
    const leaderboard = allStats.map((s) => ({
      username: s.userId ? s.userId.username : 'Unknown User', // Safety check
      accuracy: s.attempted > 0 ? (s.correct / s.attempted) * 100 : 0,
    })).sort((a, b) => b.accuracy - a.accuracy);

    const userRank = leaderboard.findIndex((p) => p.username === user.username) + 1;

    res.json({ user, stats, leaderboard, userRank });
  } catch (err) {
    console.error("❌ Error loading profile:", err.message, err.stack);
    res.status(500).json({ message: "Error loading profile" });
  }
});

// Simple Placeholder Market Maker Logic
async function updateMarketPrices(questionId, boughtOptionName, betAmount) {
  try {
    const question = await Question.findById(questionId);
    if (!question || question.resolvingOptionName) return;
    const options = question.options;
    const numOptions = options.length;
    if (numOptions < 2) return;
    const boughtOption = options.find(opt => opt.name === boughtOptionName);
    if (!boughtOption) return;

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

    let currentSum = options.reduce((sum, opt) => sum + opt.price, 0);
    let difference = 100 - currentSum;

    if (difference !== 0) {
      let adjustOption = options.find(opt => opt.name !== boughtOptionName && opt.price > 1 && opt.price < 99);
      if (!adjustOption) adjustOption = boughtOption;
      adjustOption.price = Math.max(1, Math.min(99, adjustOption.price + difference));
    }
     currentSum = options.reduce((sum, opt) => sum + opt.price, 0);
     if (currentSum !== 100 && options.length > 0) {
         options[0].price = Math.max(1, Math.min(99, options[0].price + (100 - currentSum)));
     }

    // Add new prices to history
    question.priceHistory.push({
      prices: question.options.map(opt => ({ name: opt.name, price: opt.price }))
    });

    question.markModified('options');
    question.markModified('priceHistory');
    await question.save();
    console.log(`Prices updated for question ${questionId}. New prices:`, question.options.map(o => `${o.name}: ${o.price}¢`).join(', '));

  } catch (error) {
    console.error(`❌ Error updating market prices for question ${questionId}:`, error.message);
  }
}

// Handle Bet Placement
app.post("/api/bet", async (req, res) => {
  try {
    const { questionId, selectedOptionName, betAmount, token } = req.body;
    if (!questionId || !selectedOptionName || !betAmount || !token) {
      return res.status(400).json({ message: "Missing required bet information or token" });
    }
    const amount = Number(betAmount);
    if (isNaN(amount) || amount < 1) {
        return res.status(400).json({ message: "Invalid bet amount" });
    }

    let decoded;
    try { decoded = jwt.verify(token, JWT_SECRET); }
    catch (authError) { return res.status(401).json({ message: "Invalid or expired token" }); }
    const userId = decoded.id;

    const [user, question] = await Promise.all([
        User.findById(userId),
        Question.findById(questionId)
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!question) return res.status(404).json({ message: "Question not found" });
    if (question.resolvingOptionName) {
        return res.status(400).json({ message: "Market is already resolved" });
    }
    const selectedOption = question.options.find(opt => opt.name === selectedOptionName);
    if (!selectedOption) {
      return res.status(400).json({ message: "Selected option not found" });
    }

    if (user.points < amount) {
      return res.status(400).json({ message: `Insufficient points. You have ${user.points} points.` });
    }

    const priceAtBet = selectedOption.price;
    user.points -= amount;
    const newBet = new Bet({
      userId, questionId, selectedOptionName, betAmount: amount, priceAtBet,
    });

    await Promise.all([ user.save(), newBet.save() ]);
    await updateMarketPrices(questionId, selectedOptionName, amount);

    console.log(`Bet placed: User ${userId} bet ${amount} on "${selectedOptionName}". New balance: ${user.points}`);
    res.status(201).json({ message: "Bet placed successfully", bet: newBet, newBalance: user.points });

  } catch (err) {
    console.error("❌ Error placing bet:", err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Bet validation failed", details: err.errors });
    }
    res.status(500).json({ message: "Failed to place bet" });
  }
});

//
// --- THIS IS THE FIX ---
// Admin Check Middleware MUST be defined before it is used.
//
const adminCheck = async (req, res, next) => {
  const token = req.body.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided, authorization denied" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.role === 'admin') {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ message: "Access denied: Admin role required" });
    }
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// --- NEW ADMIN ROUTE: Get ALL polls for dashboard ---
app.get("/api/admin/polls", adminCheck, async (req, res) => {
  try {
    // Fetches all polls, newest first
    const polls = await Question.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    console.error("❌ Error fetching all polls for admin:", err.message);
    res.status(500).json({ message: "Failed to fetch polls" });
  }
});

// --- NEW ADMIN ROUTE: Create a new poll ---
app.post("/api/admin/polls/create", adminCheck, async (req, res) => {
  try {
    const { title, category, articleUrl, options } = req.body;

    // Validate options
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "A poll must have at least 2 options." });
    }

    const totalPercentage = 100;
    const initialPrice = Math.floor(totalPercentage / options.length);
    let remainder = totalPercentage % options.length;

    const processedOptions = options.map((opt, index) => {
      let price = initialPrice;
      if (remainder > 0) {
        price += 1;
        remainder -= 1;
      }
      return {
        name: opt.name,
        price: price, // Set initial "price"
      };
    });
    
    // Adjust last option to ensure sum is exactly 100
    const sum = processedOptions.reduce((acc, opt) => acc + opt.price, 0);
    if (sum !== 100) {
        processedOptions[processedOptions.length - 1].price += (100 - sum);
    }

    const newQuestion = new Question({
      title,
      category: category.toLowerCase(),
      articleUrl,
      options: processedOptions,
      resolvingOptionName: null,
      priceHistory: [{ // Add initial state to history
        prices: processedOptions.map(opt => ({ name: opt.name, price: opt.price }))
      }]
    });

    await newQuestion.save();
    res.status(201).json({ message: "Poll created successfully", poll: newQuestion });

  } catch (err) {
    console.error("❌ Error creating poll:", err.message);
    res.status(500).json({ message: "Failed to create poll" });
  }
});

// Resolve Market & Payout Winners
app.post("/api/question/:id/resolve", adminCheck, async (req, res) => {
  try {
    const questionId = req.params.id; // Corrected: get ID from params
    const { winningOptionName } = req.body;
    if (!winningOptionName) {
      return res.status(400).json({ message: "Winning option name is required" });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });
    if (question.resolvingOptionName) return res.status(400).json({ message: "Market is already resolved" });
    
    const isValidOption = question.options.some(opt => opt.name === winningOptionName);
    if (!isValidOption) return res.status(400).json({ message: "Invalid winning option name" });

    question.resolvingOptionName = winningOptionName;
    await question.save();
    console.log(`Market ${questionId} resolved. Winning option: ${winningOptionName}`);

    const winningBets = await Bet.find({
      questionId: questionId,
      selectedOptionName: winningOptionName
    });

    if (winningBets.length === 0) {
      return res.status(200).json({ message: "Market resolved. No winning bets to pay out." });
    }
    console.log(`Found ${winningBets.length} winning bets. Calculating payouts...`);

    const bulkUserUpdates = [];
    for (const bet of winningBets) {
      const payout = Math.floor((100 / bet.priceAtBet) * bet.betAmount);
      console.log(`Bet ${bet._id}: User ${bet.userId} wins ${payout} points (bet ${bet.betAmount} @ ${bet.priceAtBet}¢)`);
      bulkUserUpdates.push({
        updateOne: {
          filter: { _id: bet.userId },
          update: { $inc: { points: payout } }
        }
      });
    }

    if (bulkUserUpdates.length > 0) {
      await User.bulkWrite(bulkUserUpdates);
      console.log(`Successfully paid out ${bulkUserUpdates.length} winning bets.`);
    }

    res.status(200).json({ 
        message: "Market resolved and winners paid successfully.",
        winnersPaid: bulkUserUpdates.length
    });

  } catch (err) {
    console.error("❌ Error resolving market:", err.message);
    res.status(500).json({ message: "Failed to resolve market" });
  }
});

// Start the server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));