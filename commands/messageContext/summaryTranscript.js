import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

const summaryTranscriptCommand = new ContextMenuCommandBuilder().setName('summarize_video').setType(ApplicationCommandType.Message);

export default summaryTranscriptCommand.toJSON();