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

    // TODO: 
    // --> Tag (to classify places into groups, like affected areas, place where the main impact was hit, etc)"
    // have this included in the GPT response
    const complete_prompt = query + `
        \nGiven this query, respond with only a valid JSON object in the following format:
        {
          "Rank if part of a ranked list, otherwise a number in serial order": [
            "place-name/monument-name/etc.",
            "1-2 sentences with context about the place relevant to the query. 1 sentence not about the place (where applicable) but about the event (such as info mentioning each opponent when asked about Rohit Sharma's double centuries)."
            [latitude, longitude] // latitude and longitude as numbers, in a JSON array
          ],
          ...
        }
        For each place, always include the [latitude, longitude] array as the third element. If you do not know the coordinates, return [null, null]. Return only the JSON object. Do not include any explanation, commentary, or markdown formatting. If you cannot answer, return {}.
    `;

    const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: complete_prompt
    });

    const json = extractJsonFromText(response.output_text);
    return { raw: response.output_text, json };
}

export default getData;