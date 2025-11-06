require('dotenv').config();

const NewsAPI = require('newsapi');
const Question = require("./models/question");
const { generatePredictiveQuestion } = require("./aiGenerator");

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
const TARGET_POLL_COUNT = 2; 
const MAX_ARTICLES_TO_FETCH_PER_RUN = 100;
const DELAY_BETWEEN_AI_CALLS = 2000; 

async function generateNewsPolls() {
  try {
    console.log(` Aiming to generate ${TARGET_POLL_COUNT} polls...`);
    console.log("Using NewsAPI Key:", process.env.NEWS_API_KEY ? "Set" : "Not Set!");

    if (!process.env.NEWS_API_KEY) {
      console.error("❌ NewsAPI Key is missing or not loaded!");
      return;
    }

    const topics = [ "politics", "business", "technology", "sports", "science", "world", "entertainment", "health" ];
    let successfulPolls = [];
    let fetchedArticleUrls = new Set();

    let articlesProcessedCount = 0; 
    while (successfulPolls.length < TARGET_POLL_COUNT && articlesProcessedCount < MAX_ARTICLES_TO_FETCH_PER_RUN) {
      console.log(`\n🔄 Starting new fetch cycle. ${successfulPolls.length}/${TARGET_POLL_COUNT} polls generated so far.`);
      let articlesThisCycle = [];

      console.log("Fetching batch of news articles...");
      topics.sort(() => 0.5 - Math.random()); 
      for (const topic of topics.slice(0, 4)) {
        try {
            const response = await newsapi.v2.topHeadlines({
                country: 'us',
                category: topic,
                pageSize: 5 
            });
            if (response.articles && response.articles.length > 0) {
                const categorized = response.articles.map((a) => ({ ...a, category: topic }));
                articlesThisCycle.push(...categorized);
            }
        } catch (error) {
             console.error(`NewsAPI Error fetching topic ${topic}:`, error.message || error);
        }
        await new Promise(resolve => setTimeout(resolve, 500)); 
      }
      console.log(`Fetched ${articlesThisCycle.length} raw articles this cycle.`);

      const uniqueNewArticles = articlesThisCycle.filter(article =>
          article.url && !fetchedArticleUrls.has(article.url)
      );
      console.log(`Found ${uniqueNewArticles.length} unique, unprocessed articles.`);

      if (uniqueNewArticles.length === 0) {
          console.log("⚠️ No new unique articles found in this batch. Waiting before trying again...");
          await new Promise(resolve => setTimeout(resolve, 30000)); 
          continue; 
      }

      console.log("Processing articles for AI question generation...");
      for (const article of uniqueNewArticles) {
        if (successfulPolls.length >= TARGET_POLL_COUNT) break;

        articlesProcessedCount++; 
        fetchedArticleUrls.add(article.url); 
        const headline = article.title?.replace(/ - .*$/, "") || "No Title";

        const aiQuestion = await generatePredictiveQuestion(headline);

        if (aiQuestion) {
          console.log(`✅ AI generated question for: "${headline}" (${successfulPolls.length + 1}/${TARGET_POLL_COUNT})`);
          successfulPolls.push({
            ...aiQuestion,
            articleUrl: article.url,
            category: article.category || "general",
          });
        } else {
          console.log(`🚫 Skipping headline (AI failed or unsuitable): "${headline}"`);
        }
        if (successfulPolls.length < TARGET_POLL_COUNT) { 
            console.log(`Waiting ${DELAY_BETWEEN_AI_CALLS / 1000} seconds before next AI call...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_AI_CALLS));
        }
      }

       if (articlesProcessedCount >= MAX_ARTICLES_TO_FETCH_PER_RUN && successfulPolls.length < TARGET_POLL_COUNT) {
            console.warn(`⚠️ Hit article processing limit (${MAX_ARTICLES_TO_FETCH_PER_RUN}) but only generated ${successfulPolls.length} polls. Stopping.`);
            break; 
       }


    } 
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


function generateYesNoOptions() {
  const yesPrice = Math.floor(Math.random() * 81) + 10;
  const noPrice = 100 - yesPrice;
  return [ { name: "Yes", price: yesPrice }, { name: "No", price: noPrice } ];
}

module.exports = { generateNewsPolls }; 