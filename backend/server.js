import { configDotenv } from "dotenv";
import OpenAI from "openai";
import express from "express";
import cors from "cors";
import getData from "./utils/getData.js";

configDotenv();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY_;

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const response = await getData(prompt);
    res.json({ output: response.output_text });
  } catch (err) {
    res.status(500).json({ error: err.message || "OpenAI error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
