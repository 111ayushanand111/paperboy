Here is a detailed README for the "Paperboy" project, based on the provided repository files.

-----

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
  * **APIs:** NewsAPI (for poll generation and live search)

## Project Structure

```
/paperboy-main/
├── server/             # Express.js Backend
│   ├── models/         # Mongoose Schemas (User, UserStats, Question)
│   ├── index.js        # Main server file (API routes, DB connection)
│   ├── newsPollGenerator.js # Logic for fetching from NewsAPI and creating polls
│   ├── .env            # Server environment variables
│   └── package.json
│
└── src/                # React.js Frontend
    ├── components/     # Reusable React components (Header, PollCard, etc.)
    ├── pages/          # View components (Login, Register, Profile)
    ├── App.jsx         # Main application component (poll feed)
    ├── main.jsx        # React entrypoint and routing
    └── ...
├── index.html
└── package.json        # Client package.json
```
🚀 Setup and Installation
Follow these instructions to get the project running locally on your machine.

Prerequisites
Node.js: Make sure you have Node.js (which includes npm) installed. Download Node.js

MongoDB: You must have a MongoDB server running locally. Download MongoDB Community Server

Step 1: Clone the Repository
Clone the project to your local machine (if you haven't already):

Bash

git clone https://github.com/YourUsername/YourNewRepoName.git
cd YourNewRepoName
This project has two parts: the Backend Server (in the /server folder) and the Frontend Client (in the root folder). You must install dependencies and run both.

Step 2: Backend Setup (Terminal 1)
Navigate into the server directory:

Bash

cd server
Install all required backend dependencies (including express, mongoose, openai, etc.):

Bash

npm install
Create the Environment File: Create a new file in the server folder named .env and paste the following content into it:

# Your local MongoDB connection string
MONGO_URI=mongodb://127.0.0.1:27017/paperboy

# Your API key from https://newsapi.org/
NEWS_API_KEY=<PASTE_YOUR_NEWS_API_KEY>

# Your API key from https://huggingface.co/ (or other router)
HF_TOKEN=<PASTE_YOUR_HUGGINGFACE_TOKEN>
Note: You must replace the placeholders with your actual API keys.

Start the backend server:

Bash

npm start
The server should now be running on http://localhost:5000.

Step 3: Frontend Setup (Terminal 2)
Open a new, separate terminal window.

Make sure you are in the project's root folder (the one containing src, server, and package.json).

Install all required frontend dependencies (including react, axios, etc.):

Bash

npm install
Start the frontend development server:

Bash

npm run dev
The React app should now be running on http://localhost:5173 (or the next available port).
## API Endpoints

The backend server (`http://localhost:5000`) provides the following endpoints:

  * `POST /api/register`: Creates a new user.
  * `POST /api/login`: Logs in a user and returns a JWT.
  * `GET /api/profile`: (Auth Required) Gets the logged-in user's data, quiz stats, and the global leaderboard.
  * `GET /api/questions`: Gets polls. Can be filtered with `?category=...` (e.g., `politics`, `trending`).
  * `POST /api/answer`: Submits a poll answer. Updates user stats if a valid token is provided.
  * `GET /api/search-news`: Searches NewsAPI for articles. Requires a query param `?q=...`.
  * `GET /api/generate-news`: Manually triggers the script to fetch new articles and generate polls.

## Authors

  * Ayush Anand
  * Shivam Yogesh Mishra
  * Shaurya Bhardwaj
  * Rishit Balaji
  * Adabala Sridhar
  * Murari Kandagatla

## License

This project is licensed under the MIT License.
