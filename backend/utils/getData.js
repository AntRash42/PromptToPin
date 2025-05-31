import OpenAI from "openai";

async function getData(topic) {
    const client = new OpenAI(
        {apiKey: process.env.OPENAI_API_KEY_}
    );

    const complete_prompt = "From the given text, extract the geographical locations/places in the format: 'place-full-name/monument-name, city-name, state name || Tag(to classify places into groups, like affected areas, place where the main impact was hit, etc) || Short-Comment-for-the-place-based-on-the-info', no header, no extra stuff" + topic;

    const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: complete_prompt
    });

    return response
}

export default getData;