require('dotenv').config();
const { OpenAI } = require("openai"); // Using the OpenAI library

const API_KEY = process.env.HF_TOKEN; // Your HF Token from .env
// --- Use the new DeepSeek model ID provided ---
const MODEL_ID = "deepseek-ai/DeepSeek-V3.2-Exp:novita";
// ---

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1", // HF router URL
  apiKey: API_KEY,                             // Your HF Token
});

// System prompt defining the task
const SYSTEM_PROMPT = `You are a helpful assistant that creates predictive market questions from news headlines.
You must ONLY respond with a valid JSON object.
The JSON object must have two keys: "title" (string) and "options" (array).
The "title" should be a short, predictive question about a future, verifiable outcome.
The "options" array should contain 2-4 objects, each with a "name" (string) key.
Do NOT include "price" or "isCorrect" in the options.
If the headline is not suitable for a predictive question (e.g., "10 Best Movies of 2024"), respond ONLY with: {"title": "NOT_SUITABLE", "options": []}
`;

/**
 * Takes a news headline and returns an AI-generated predictive question and options.
 * Tries to fail faster on non-recoverable errors.
 * @param {string} headline - The news headline to base the question on.
 * @returns {Promise<{title: string, options: Array<{name: string, price: number}>}> | null}
 */
async function generatePredictiveQuestion(headline) {
  if (!API_KEY) {
    console.error("Hugging Face API token (HF_TOKEN) not found in .env");
    return null;
  }

  const user_prompt = `Analyze the following headline and generate the JSON:\nHEADLINE: "${headline}"`;
  let retries = 3; // Max retries for recoverable errors
  let delay = 5000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`AI (HF/OpenAI Lib) Attempt ${attempt}/${retries} for: "${headline}" using model ${MODEL_ID}`);
    try {
      const chatCompletion = await client.chat.completions.create({
        model: MODEL_ID, // Use the new DeepSeek model ID
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: user_prompt },
        ],
        // Removed response_format previously, keep it removed
        temperature: 0.6,
        max_tokens: 300, // Keep increased token limit
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content?.trim();

      if (!aiResponse) {
        console.error(`AI (HF/OpenAI Lib): Empty response received on attempt ${attempt}. Skipping retries for this headline.`);
        return null;
      }

       console.log(`AI (HF/OpenAI Lib) Raw Response for "${headline}":`, aiResponse);

      let data;
      try {
         const jsonMatch = aiResponse.match(/\{.*\}/s);
         if (!jsonMatch) {
            console.error(`AI (HF/OpenAI Lib): No JSON object found in the response for "${headline}". Raw:`, aiResponse);
            return null; // Fail fast if no JSON found
         }
         const jsonString = jsonMatch[0];
         data = JSON.parse(jsonString);
      } catch (parseError) {
         console.error(`AI (HF/OpenAI Lib): Failed to extract/parse JSON for "${headline}": ${parseError.message}. Raw Response:`, aiResponse);
         return null; // Fail fast on parsing error
      }


      if (data.title === "NOT_SUITABLE") {
        console.log(`AI (HF/OpenAI Lib): Headline determined not suitable: "${headline}"`);
        return null;
      }

      if (!data.title || !data.options || data.options.length < 2) {
         console.error(`AI (HF/OpenAI Lib): Invalid JSON structure received for "${headline}" (and not 'NOT_SUITABLE')`, data);
         return null; // Fail fast on invalid structure
      }

      // Add default prices
      const price = Math.floor(100 / data.options.length);
      const pricedOptions = data.options.map((opt) => ({
        name: String(opt.name || 'Invalid Option'),
        price: price,
      }));

      return { // Success!
        title: String(data.title),
        options: pricedOptions,
      };

    } catch (error) {
       // Error Handling: Only retry specific errors
       const status = error.status;
       const errorMessage = error.message || 'Unknown error';
       const errorDetails = error.error?.message || error.response?.data?.error?.message;

       console.error(`AI (HF/OpenAI Lib) Error on attempt ${attempt} for "${headline}": Status ${status || 'N/A'}, Message: ${errorMessage}`, errorDetails ? `Details: ${errorDetails}`: '');

       // ONLY Retry for Rate Limits (429) or potential temporary server/network issues (5xx, timeout, network error)
       if (status === 429 || status >= 500 || errorMessage.includes("timeout") || errorMessage.includes("network error") || errorMessage.includes("HTTP error")) {
         if (attempt < retries) {
           const retryType = status === 429 ? "Rate limited" : "Server/Network issue";
           console.log(`AI (HF/OpenAI Lib): ${retryType}. Retrying in ${delay / 1000}s...`);
           await new Promise(resolve => setTimeout(resolve, delay));
           delay *= 2;
           continue; // Go to the next attempt
         } else {
           console.error(`AI (HF/OpenAI Lib): Failed after ${retries} attempts due to ${status === 429 ? 'rate limit' : 'server/network issues'}.`);
           return null; // Stop after max retries for these errors
         }
       } else {
         // For any other error (Auth, Not Found, Bad Request, etc.), FAIL FAST
         console.error(`AI (HF/OpenAI Lib): Non-retryable error encountered (Status: ${status}). Skipping retries.`);
         return null;
       }
    } // End catch block
  } // End for loop (retries)
  console.error(`AI (HF/OpenAI Lib): All ${retries} attempts failed unexpectedly for headline "${headline}"`);
  return null;
}

module.exports = { generatePredictiveQuestion };