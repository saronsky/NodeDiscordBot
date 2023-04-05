import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

const transcriptCommand = new ContextMenuCommandBuilder().setName('transcribe').setType(ApplicationCommandType.Message);

export default transcriptCommand.toJSON();