import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"

dotenv.config()
// Declare a new google generative obj
const genAI = new GoogleGenerativeAI(process.env.API_KEY)
