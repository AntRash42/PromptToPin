import OpenAI from "openai";

function extractJsonFromText(text) {
    try {
        return JSON.parse(text);
    } catch {}
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch {}
    }
    return null;
}

async function getData(query) {
    const client = new OpenAI(
        {apiKey: process.env.OPENAI_API_KEY_}
    );

    const complete_prompt = query + `
        \nGiven this query, respond with only a valid JSON object in the following format:
        {
          "place-full-name, monument-name, city-name, state-name": [
            "Tag (to classify places into groups, like affected areas, place where the main impact was hit, etc)",
            "2-3 sentences with context about the place relevant to the query"
          ],
          ...
        }
        Return only the JSON object. Do not include any explanation, commentary, or markdown formatting. If you cannot answer, return {}.
    `;

    const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: complete_prompt
    });

    const json = extractJsonFromText(response.output_text);
    return { raw: response.output_text, json };
}

export default getData;