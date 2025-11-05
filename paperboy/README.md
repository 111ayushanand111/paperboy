# Paperboy 📰

Paperboy is a web application that gamifies news consumption. It automatically fetches the latest news articles from various categories, generates multiple-choice polls based on their headlines, and allows users to vote on them. Registered users can track their statistics, accuracy, and compete on a global leaderboard.

## Core Features

* **Dynamic Poll Generation:** Automatically fetches top headlines from the **NewsAPI** across various topics (politics, sports, tech, etc.) and converts them into interactive polls.
* **User Authentication:** Secure user registration and login system using **JWT (JSON Web Tokens)** for authentication and **bcrypt** for password hashing.
* **Gamified User Stats:** Registered users have a profile page that tracks their total polls attempted, correct answers, and overall accuracy percentage, complete with a progress bar.
* **Global Leaderboard:** The profile page also features a global leaderboard, ranking all users by their accuracy.
* **Category Filtering:** The main feed allows users to filter polls by category, including "For You" (randomized), "Trending", "Politics", "Science", "Sports", and "Tech".
* **Live News Search:** A search bar in the header allows users to search for real-time news articles directly from the NewsAPI.
* **Interactive UI:** Built with **React**, featuring a "Top News" carousel, category navigation, and responsive poll cards that provide instant feedback.

## Tech Stack

* **Frontend:** React, Vite, React Router, Axios, CSS Modules
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **APIs:** NewsAPI (for poll generation and live search), HuggingFace Inference (for AI generation)

## Project Structure
/ (repository root) ├── paperboy/ # React.js Frontend │ ├── server/ # Express.js Backend │ │ ├── models/ # Mongoose Schemas (User, UserStats, Question, Bet) │ │ ├── index.js # Main server file (API routes, DB connection) │ │ ├── newsPollGenerator.js # Logic for fetching from NewsAPI │ │ ├── .env # (Must be created) Server environment variables │ │ └── package.json │ │ │ ├── src/ # React components and pages │ ├── index.html │ ├── package.json # (Frontend package.json) │ └── vite.config.js │ ├── README.md # This file └── package.json # Root package.json

# 🚀 Setup and Installation

Follow these instructions to get the project running locally on your machine.

### Prerequisites

* **Node.js:** Make sure you have Node.js (which includes npm) installed. [Download Node.js](https://nodejs.org/)
* **MongoDB:** You must have a MongoDB server running locally. [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)

### Step 1: Clone the Repository

Clone the project to your local machine:

```bash
git clone [https://github.com/YourUsername/YourRepoName.git](https://github.com/YourUsername/YourRepoName.git)
cd YourRepoName
This project has two main parts that need to be run separately: the Backend Server (inside /paperboy/server) and the Frontend Client (inside /paperboy).

Step 2: Backend Setup (Terminal 1)
Navigate into the backend server directory:

Bash

cd paperboy/server
Install all required backend dependencies:

Bash

npm install
Create the Environment File: Create a new file in the current (paperboy/server) folder named .env and paste the following content into it.

Code snippet

# Your local MongoDB connection string
MONGO_URI=mongodb://127.0.0.1:27017/paperboy

# Your API key from [https://newsapi.org/](https://newsapi.org/)
NEWS_API_KEY=<PASTE_YOUR_NEWS_API_KEY>

# Your API key from [https://huggingface.co/](https://huggingface.co/) (for AI poll generation)
HF_TOKEN=<PASTE_YOUR_HUGGINGFACE_TOKEN>
Note: You must replace the placeholders with your actual API keys to fetch news and generate polls.

Start the backend server:

Bash

npm start
The server should now be running on http://localhost:5000.

Step 3: Frontend Setup (Terminal 2)
Open a new, separate terminal window.

Navigate into the frontend client directory (the parent of the server folder):

Bash

cd paperboy
(If you are in the root directory of the repo, just cd paperboy)

Install all required frontend dependencies:

Bash

npm install
Start the frontend development server:

Bash

npm run dev
The React app should now be running on http://localhost:5173 (or the next available port).

API Endpoints
The backend server (http://localhost:5000) provides the following endpoints:

POST /api/register: Creates a new user.

POST /api/login: Logs in a user and returns a JWT.

GET /api/profile: (Auth Required) Gets the logged-in user's data, quiz stats, and the global leaderboard.

GET /api/questions: Gets polls. Can be filtered with ?category=... (e.g., politics, trending).

POST /api/answer: Submits a poll answer. Updates user stats if a valid token is provided.

GET /api/search-news: Searches NewsAPI for articles. Requires a query param ?q=....

GET /api/generate-news: Manually triggers the script to fetch new articles and generate polls.

GET /api/top-headlines: Fetches general top headlines for the news carousel.

GET /api/question/:id: Gets a single poll by its ID.

POST /api/bet: (Auth Required) Places a bet on a prediction market.

POST /api/question/:id/resolve: (Admin Auth Required) Resolves a market and pays out winners.

Authors
Ayush Anand

Shivam Yogesh Mishra

Shaurya Bhardwaj

Rishit Balaji

Adabala Sridhar

Murari Kandagatla

License
This project is licensed under the MIT License.