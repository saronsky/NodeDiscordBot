import { SlashCommandBuilder } from "discord.js";

const questionCommand = new SlashCommandBuilder().setName('question').setDescription('Ask ChatGPT a question').addStringOption((option) =>
    option
        .setName('query')
        .setDescription("test")
        .setRequired(true)
);

export default questionCommand.toJSON();

