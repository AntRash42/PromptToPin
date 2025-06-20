import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import getFullCoords from "./utils/getCoords.js";

configDotenv();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    console.log("Received prompt:", prompt);
    const dataResponse = await (await import("./utils/getData.js")).default(prompt);
    console.log("GPT raw response:", dataResponse.raw);
    console.log("GPT parsed JSON:", dataResponse.json);
    const response = await getFullCoords(prompt);
    console.log("Response from getFullCoords:", response);
    res.json({ output: response.raw, json: response });
  } catch (err) {
    res.status(500).json({ error: err.message || "OpenAI error" });
  }
});

app.post("/api/coords", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    console.log("Received prompt for coords:", prompt);
    const coordsObj = await (await import("./utils/getCoords.js")).default(prompt);
    console.log("Coords object:", coordsObj);
    res.json(coordsObj);
  } catch (err) {
    res.status(500).json({ error: err.message || "Coords error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
