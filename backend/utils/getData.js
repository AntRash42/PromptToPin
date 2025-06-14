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
          "rank or serial number (e.g. 1, 2, 3, ... or I, II, III, ... or A, B, C, ... as appropriate)": [
            "Place name (full name, monument name, city name, state name, etc)",
            "Tag (a short, clear category label for this place, e.g. 'affected area', 'main impact', 'capital', 'monument', 'city', etc)",
            "1-2 sentences with context about the place relevant to the query. 1 sentence not about the place (where applicable) but about the event (such as info mentioning each opponent when asked about Rohit Sharma's double centuries).",
            [latitude, longitude], // latitude and longitude as numbers, in a JSON array
            "#RRGGBB", // hex colour code for this category, as specified by the user or chosen to be visually distinct
            [citations] // an array of URLs or references (as strings) used for this place, or an empty array if none
          ],
          ...
        }
        The key for each entry must be the rank (if ranking is relevant to the query) or a serial number (1, 2, 3, ...) if not. The value array must start with the place name, followed by tag, description, coordinates, color, and citations as above. If you do not know the coordinates, return [null, null]. If you do not have citations, return an empty array. Return only the JSON object. Do not include any explanation, commentary, or markdown formatting. If you cannot answer, return {}.
    `;

    const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: complete_prompt
    });

    const json = extractJsonFromText(response.output_text);
    return { raw: response.output_text, json };
}

export default getData;