import { SlashCommandBuilder } from "discord.js";

const summarizeArticleCommand = new SlashCommandBuilder().setName('summarize_article').setDescription('Ask ChatGPT to Summarize an Article').addStringOption((option) =>
    option
        .setName('article_url')
        .setDescription("test")
        .setRequired(true)
).addStringOption((option) =>
    option
        .setName('custom_prompt')
        .setDescription("test")
        .setRequired(false)
);

export default summarizeArticleCommand.toJSON();