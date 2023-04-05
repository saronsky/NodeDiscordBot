import { SlashCommandBuilder } from "discord.js";

const transcriptCommand = new SlashCommandBuilder().setName('transcribe').setDescription('Ask Whisper AI to transcribe a Youtube video').addStringOption((option) =>
    option
        .setName('youtube_url')
        .setDescription("test")
        .setRequired(true)
);

export default transcriptCommand.toJSON();


