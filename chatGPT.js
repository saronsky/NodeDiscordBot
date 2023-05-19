import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import Cost from './queryCost.js'
dotenv.config();
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
);
export default async function ask(questionText, client) {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant who responds succinctly" },
            { role: "user", content: questionText }
        ],
    })

    Cost(client, parseFloat(response.data.usage.total_tokens) * (0.002 / 1000), "Question")


    const content = response.data.choices[0].message.content;
    return content
}