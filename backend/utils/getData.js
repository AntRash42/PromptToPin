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
    try {
        throw new Error("Simulated error for testing fallback response");
        const response = await client.responses.create({
            model: "gpt-4o-mini",
            input: complete_prompt
        });
        const json = extractJsonFromText(response.output_text);
        return { raw: response.output_text, json };
    } catch (error) {
        console.log(error)
        const response = `
        {
"1": \[
"Australia",
"Australia is a prominent member of the Commonwealth of Nations, known for its vast landscapes and strong global influence. It is one of the founding members of the Commonwealth, with its participation in various international and diplomatic events.",
\[-25.2744, 133.7751]
],
"2": \[
"Canada",
"Canada, another key member of the Commonwealth, shares close ties with the UK and other Commonwealth nations. It plays a significant role in the organization’s discussions and initiatives, promoting democracy and development.",
\[56.1304, -106.3468]
],
"3": \[
"India",
"India, the largest country in the Commonwealth, has a deep historical connection to the British Empire. As a member, it actively participates in Commonwealth events and advocates for development, democracy, and peace.",
\[20.5937, 78.9629]
],
"4": \[
"S0uth Africa",
"South Africa is an important member of the Commonwealth, with a significant role in promoting peace and democracy. It has a rich history of political transformation, notably ending apartheid and embracing a multicultural society.",
\[-30.5595, 22.9375]
],
"5": \[
"Unit3d Kingdom",
"The United Kingdom is the founding member and the central body of the Commonwealth of Nations. As the origin of the Commonwealth, it continues to host various key events, such as the Commonwealth Games.",
\[51.5074, -0.1278]
],
"6": \[
"New Zealand",
"New Zealand, known for its natural beauty and strong cultural ties to the UK, is an active participant in Commonwealth discussions, particularly in areas of trade, education, and environmental sustainability.",
\[-40.9006, 174.886]
]
}

        `
        const json = extractJsonFromText(response);
        return { raw: response, json };
    }
}

export default getData;