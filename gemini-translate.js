import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pkg from '@google-cloud/translate';
const { Translate } = pkg.v2; 
import readline from "readline"; // for reading input from the command line.
dotenv.config();

// Check if API_KEY or GOOGLE_TRANSLATE_API_KEY is loaded correctly
if (!process.env.API_KEY || !process.env.GOOGLE_TRANSLATE_API_KEY) {
  console.error("API_KEY or GOOGLE_TRANSLATE_API_KEY is not defined in environment variables.");
  process.exit(1);
}

// 1. Setting up the connection to Google Generative AI.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// 2.  setting up the connection to Google Translate API.
const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });


// Sets up a readline interface to interact with the user via the command line.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


// Takes text and a target language code and translates the text using Google Translate.
async function translateText(text, targetLanguage) {
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error("Error translating text: ", error);
    return text; // Return original text in case of error
  }
}

async function run() {
  try {

    // Initializes the Generative AI model (gemini-pro) and starts a chat session.
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Chat Interaction
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });


    async function askAndResponse() { 
      // 1. Prompts the user for input.     
      rl.question("YOU: ", async (msg) => {
        if (msg.toLowerCase() === "exit") {
          rl.close();
        } else {
          try {

            // 2. Sends the input message to the chatbot.
            const result = await chat.sendMessage(msg);
            const response = await result.response;

            const englishText = await response.text();
            console.log("AI (English): ", englishText);

            // Translate response to Arabic
            const arabicText = await translateText(englishText, 'ar');
            console.log("AI (Arabic): ", arabicText);

          } catch (error) {
            console.error("Error sending message: ", error);
          }
          askAndResponse(); // Recursively call after processing
        }
      });
    }

    askAndResponse(); // Start the interaction loop
  } catch (error) {
    console.error("Error initializing chat: ", error);
  }
}

run();
