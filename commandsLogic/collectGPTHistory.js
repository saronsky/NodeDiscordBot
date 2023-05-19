import fs from "fs";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import Cost from './queryCost.js'
dotenv.config();
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
);
export default async function history(message, client) {
    const messageQuestion = message.content.replaceAll(/<@([^>]+)>/g, "");
    const transcript = fs.readFileSync("./transcripts/" + (await message.fetchReference()).id + ".txt", { encoding: 'utf8', flag: 'r' })
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant who responds succinctly" },
            { role: "user", content: "Read this text: " + transcript },
            { role: "user", content: messageQuestion }
        ],
    })

    Cost(client, parseFloat(response.data.usage.total_tokens) * (0.002 / 1000), "Question")


    const content = response.data.choices[0].message.content;
    return content
}