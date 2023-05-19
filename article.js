import { extract } from "@extractus/article-extractor";
import Ask from './chatGPT.js';

export default async function main(article_url, custom_prompt, client) {
    const output = await extract(article_url)

    return String(
        await Ask(
            custom_prompt +": "+ output.content, client)
    )
}