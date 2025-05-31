import { configDotenv } from "dotenv";
import OpenAI from "openai";

configDotenv();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY_

const client = new OpenAI(
    {apiKey: OPENAI_API_KEY}
);

const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);
