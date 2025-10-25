require('dotenv').config();

const NewsAPI = require('newsapi');
const Question = require("./models/question");
// Assuming aiGenerator.js correctly returns null on any failure
const { generatePredictiveQuestion } = require("./aiGenerator");

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
const TARGET_POLL_COUNT = 2; // Target number of successful polls
const MAX_ARTICLES_TO_FETCH_PER_RUN = 100; // Safety limit for total articles processed
const DELAY_BETWEEN_AI_CALLS = 2000; // 5 seconds - Adjust if rate limits hit

async function generateNewsPolls() {
  try {
    console.log(`🎯 Aiming to generate ${TARGET_POLL_COUNT} polls...`);
    console.log("🔑 Using NewsAPI Key:", process.env.NEWS_API_KEY ? "Set" : "Not Set!");

    if (!process.env.NEWS_API_KEY) {
      console.error("❌ NewsAPI Key is missing or not loaded!");
      return;
    }

    const topics = [ "politics", "business", "technology", "sports", "science", "world", "entertainment", "health" ];
    let successfulPolls = [];
    let fetchedArticleUrls = new Set(); // Track processed URLs

    // --- Loop until target count is reached ---
    let articlesProcessedCount = 0; // Counter for safety break
    while (successfulPolls.length < TARGET_POLL_COUNT && articlesProcessedCount < MAX_ARTICLES_TO_FETCH_PER_RUN) {
      console.log(`\n🔄 Starting new fetch cycle. ${successfulPolls.length}/${TARGET_POLL_COUNT} polls generated so far.`);
      let articlesThisCycle = [];

      // Fetch a batch of articles (e.g., 5 per topic from 4 random topics)
      console.log("Fetching batch of news articles...");
      topics.sort(() => 0.5 - Math.random()); // Shuffle topics
      for (const topic of topics.slice(0, 4)) {
        try {
            const response = await newsapi.v2.topHeadlines({
                country: 'us',
                category: topic,
                pageSize: 5 // Fetch a decent number per topic
            });
            if (response.articles && response.articles.length > 0) {
                const categorized = response.articles.map((a) => ({ ...a, category: topic }));
                articlesThisCycle.push(...categorized);
            }
        } catch (error) {
             console.error(`NewsAPI Error fetching topic ${topic}:`, error.message || error);
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between topic fetches
      }
      console.log(`Fetched ${articlesThisCycle.length} raw articles this cycle.`);

      const uniqueNewArticles = articlesThisCycle.filter(article =>
          article.url && !fetchedArticleUrls.has(article.url)
      );
      console.log(`Found ${uniqueNewArticles.length} unique, unprocessed articles.`);

      if (uniqueNewArticles.length === 0) {
          console.log("⚠️ No new unique articles found in this batch. Waiting before trying again...");
          await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s
          continue; // Start next loop iteration
      }

      console.log("Processing articles for AI question generation...");
      for (const article of uniqueNewArticles) {
        if (successfulPolls.length >= TARGET_POLL_COUNT) break; // Stop if target reached mid-batch

        articlesProcessedCount++; // Increment safety counter
        fetchedArticleUrls.add(article.url); // Mark as processed
        const headline = article.title?.replace(/ - .*$/, "") || "No Title";

        // --- Call AI (aiGenerator handles retries for recoverable errors) ---
        const aiQuestion = await generatePredictiveQuestion(headline);

        // --- Handle Result ---
        if (aiQuestion) {
          // AI Success: Add the poll
          console.log(`✅ AI generated question for: "${headline}" (${successfulPolls.length + 1}/${TARGET_POLL_COUNT})`);
          successfulPolls.push({
            ...aiQuestion,
            articleUrl: article.url,
            category: article.category || "general",
          });
        } else {
          // AI Failure/Unsuitable/Error: Skip entirely, DO NOT add fallback
          console.log(`🚫 Skipping headline (AI failed or unsuitable): "${headline}"`);
        }
        // --- End Handle Result ---

        // Add delay BETWEEN AI calls to respect rate limits
        if (successfulPolls.length < TARGET_POLL_COUNT) { // Don't delay after the last needed call
            console.log(`Waiting ${DELAY_BETWEEN_AI_CALLS / 1000} seconds before next AI call...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_AI_CALLS));
        }
      } // End processing articles loop

       // Check safety break
       if (articlesProcessedCount >= MAX_ARTICLES_TO_FETCH_PER_RUN && successfulPolls.length < TARGET_POLL_COUNT) {
            console.warn(`⚠️ Hit article processing limit (${MAX_ARTICLES_TO_FETCH_PER_RUN}) but only generated ${successfulPolls.length} polls. Stopping.`);
            break; // Exit the while loop
       }


    } // End while loop (target count or safety break)

    // --- Final Database Update ---
    console.log(`\n🏁 Finished generation loop. ${successfulPolls.length} polls created.`);
    if (successfulPolls.length > 0) {
        await Question.deleteMany({});
        console.log("🗑️ Cleared old polls from database.");
        await Question.insertMany(successfulPolls);
        console.log(`💾 Successfully added ${successfulPolls.length} new polls to the database.`);
    } else {
        console.log("⚠️ No successful polls generated, database not updated.");
    }

  } catch (error) {
    console.error("❌ Unexpected error during the poll generation process:", error.message);
  }
}


// Fallback function (no longer called by generateNewsPolls)
function generateYesNoOptions() {
  const yesPrice = Math.floor(Math.random() * 81) + 10;
  const noPrice = 100 - yesPrice;
  return [ { name: "Yes", price: yesPrice }, { name: "No", price: noPrice } ];
}

module.exports = { generateNewsPolls }; // Only export the main function now