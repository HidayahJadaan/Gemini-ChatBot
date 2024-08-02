import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pkg from '@google-cloud/translate';
const { Translate } = pkg.v2;
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Check if API_KEY or GOOGLE_TRANSLATE_API_KEY is loaded correctly
if (!process.env.API_KEY || !process.env.GOOGLE_TRANSLATE_API_KEY) {
  console.error("API_KEY or GOOGLE_TRANSLATE_API_KEY is not defined in environment variables.");
  process.exit(1);
}

// Initialize Google Generative AI and Translate client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });

const app = express();
const port = 5000;

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.post('/message', async (req, res) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();

    // Translate response to Arabic
    const [arabicText] = await translate.translate(response, 'ar');

    // Respond with both English and Arabic text
    res.json({
      english: response,
      arabic: arabicText
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
