import OpenAI from "openai";

async function getInfo(topic) {
    const client = new OpenAI(
        {apiKey: process.env.OPENAI_API_KEY_}
    );

    const complete_prompt = "Write a short info about the topic, focusing on the current geographical locations, the topic is: " + topic;

    const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: complete_prompt
    });

    return response
}

export default getInfo;