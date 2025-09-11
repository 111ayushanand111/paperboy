# Paperboy

Prediction-based Platform for Gamifying News

Paperboy is a web-based prediction and news gamification platform designed to make consuming news more engaging and interactive. Users can make predictions on current events, earn points, build streaks, and compete on leaderboards — turning news into an informed, competitive, and fun experience.

---

## Features

* User Authentication (via Firebase)
* Curated News Events from third-party APIs
* Prediction System – make predictions on active events
* Leaderboards & Gamification – points, ranks, and streak tracking
* Admin Event Resolution System
* Notifications for event results

---

## Tech Stack

* Frontend: React.js, Tailwind CSS
* Backend: Node.js, Express.js
* Database: MongoDB
* Hosting & Authentication: Firebase
* APIs: Third-party News API

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/paperboy.git
   cd paperboy
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Create a `.env` file in the backend with the following:

   ```
   MONGO_URI=<your-mongodb-uri>
   FIREBASE_API_KEY=<your-firebase-api-key>
   NEWS_API_KEY=<your-news-api-key>
   JWT_SECRET=<your-secret-key>
   ```

4. Run the development servers:

   ```bash
   cd client
   npm start
   # In another terminal
   cd server
   npm run dev
   ```

---

## Usage

* Register or log in with your email and password
* Browse active news events and make predictions
* Earn points and track streaks
* View rankings on the leaderboard
* Admins can resolve events and update results

---

## Contributing

1. Fork the repo
2. Create a new branch (`feature/your-feature-name`)
3. Commit your changes
4. Push to your fork
5. Open a Pull Request

---

## Authors

* Ayush Anand - [iit2024246@iiita.ac.in](mailto:iit2024246@iiita.ac.in)
* Shivam Yogesh Mishra - [iit2024215@iiita.ac.in](mailto:iit2024215@iiita.ac.in)
* Shaurya Bhardwaj - [iit2024251@iiita.ac.in](mailto:iit2024251@iiita.ac.in)
* Rishit Balaji - [iit2024242@iiita.ac.in](mailto:iit2024242@iiita.ac.in)
* Adabala Sridhar - [iit2024218@iiita.ac.in](mailto:iit2024218@iiita.ac.in)
* Murari Kandagatla - [iit2024252@iiita.ac.in](mailto:iit2024252@iiita.ac.in)

---

## License

This project is licensed under the MIT License.

---

Do you want me to also include a **project structure tree** (like `/client`, `/server`, `/docs`, etc.) in the README for clarity?
