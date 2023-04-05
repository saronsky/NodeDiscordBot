import { SlashCommandBuilder } from "discord.js";

const summaryTranscriptCommand = new SlashCommandBuilder().setName('summarize_video').setDescription('Ask OpenAI to transcribe and summarize a Youtube video').addStringOption((option) =>
    option
        .setName('youtube_url')
        .setDescription("test")
        .setRequired(true)
);

export default summaryTranscriptCommand.toJSON();


