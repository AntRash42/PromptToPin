import OpenAI from "openai";

function extractJsonFromText(text) {
    try {
        // Try to parse directly
        return JSON.parse(text);
    } catch (e) {}

    // Try to extract the first potential JSON object
    const match = text.match(/{[\s\S]*}/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch (e) {}
    }

    // Try to fix common JSON issues:
    let fixed = text
        .replace(/\'([^']*)\'/g, '"$1"')               // Replace single quotes with double quotes
        .replace(/,\s*([}\]])/g, '$1')                 // Remove trailing commas
        .replace(/\\\[/g, '[')                          // Unescape [
        .replace(/\\\]/g, ']')                          // Unescape ]
        .replace(/\\\"/g, '"')                          // Handle escaped quotes within strings
        .replace(/\\'/g, "'")                          // Handle escaped single quotes within strings
        .replace(/\\\n/g, '\\n');                       // Handle newlines if any are escaped

    try {
        return JSON.parse(fixed); // Attempt to parse the fixed string
    } catch (e) {
        console.error('Failed to parse as JSON:', e.message, 'Raw output:', text);
        return null;
    }
}

async function getData(query) {
    const client = new OpenAI(
        {apiKey: process.env.OPENAI_API_KEY_}
    );

    const instrunctions = `
Given the query, respond with only a valid JSON object in the following format:
{
  "places": {
    "rank or serial number (e.g. 1, 2, 3, ... or I, II, III, ... or A, B, C, ...)": [
      "Place name (full name, monument name, city name, state name, etc)",
      "Tag (a short, clear category label for this place, e.g. 'monument', 'stadium', 'city', 'park', etc.)",
      "1-2 sentences with context about the place relevant to the query. 1 sentence not about the place but about the event (e.g., mentioning each opponent when asked about Rohit Sharma's double centuries).",
      [latitude, longitude], // latitude and longitude as numbers in a JSON array
      "#RRGGBB", // hex color code for this category, may or may not be specified by the user. All the places of the same category must have the same color code.
      [citations] // an array of URLs or references (as strings) used for this place, or an empty array if none
    ],
    ...
  },
  "legend": {
    "category1": "#RRGGBB", 
    "category2": "#RRGGBB",
    ...
  }
}

All places of the same category must have the same color code, and the legend must contain all the categories used in the places. The legend must be a JSON object with category names as keys and their corresponding color codes as values.

If the user has not specified any color, color all the pins in a different color, and make legend for "place1": "color1"

The key for each entry must be the rank (if ranking is relevant to the query) or a serial number (1, 2, 3, ...) if not. The value array must start with the place name, followed by the tag, description, coordinates, color, and citations as above. If you do not know the coordinates, return [null, null]. If you do not have citations, return an empty array.

Return only the JSON object. Do not include any explanation, commentary, or markdown formatting. If you cannot answer, return an empty JSON object: {}.
`;


    try {
        const response = await client.responses.create({
            model: "gpt-4o-mini",
            instructions: instrunctions,
            input: query
        });
        console.log("GPT responded:");
        const json = extractJsonFromText(response.output_text);
        console.log("Parsed JSON");
        return { raw: response.output_text, json };
    } catch (error) {
        console.log(error)
        // Return a valid empty object as fallback to avoid JSON parse errors
        return { raw: '{}', json: {} };
    }
}

export default getData;