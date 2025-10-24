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

## Setup and Installation

### Prerequisites

  * **Node.js** (v18 or higher)
  * **MongoDB** (a running local or cloud instance)
  * A **NewsAPI Key** from [newsapi.org](https://newsapi.org/)

-----

### 1\. Backend (Server) Setup

1.  Navigate to the server directory:

    ```bash
    cd server
    ```

2.  Install server dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the `server/` directory and add your configuration:

    ```.env
    # Your MongoDB connection string
    MONGO_URI=mongodb://127.0.0.1:27017/paperboy

    # Your key from newsapi.org
    NEWS_API_KEY=<your_newsapi_key>
    ```

    *(Note: The `JWT_SECRET` is currently hardcoded in `server/index.js` as `"paperboy_secret"`).*

4.  Start the backend server:

    ```bash
    npm start
    ```

    The server will be running on `http://localhost:5000`.

-----

### 2\. Frontend (Client) Setup

1.  From the project's **root directory** (`paperboy-main - Copy/`), install the client dependencies:
    ```bash
    npm install
    ```
2.  Run the client development server:
    ```bash
    npm run dev
    ```
    The React application will be available at `http://localhost:5173` (or a similar port).

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
