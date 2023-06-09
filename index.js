/*For in-context replies:
Messageid- id of ChatGPT response, as this is what will be referenced in reply
Save transcription in messageid-transcription.txt file. 
Save all interactions in ChatGPT:.. User:... format in messageid.txt*/

import dotenv from "dotenv";
import collect from "collect";
import fs from "fs";
import { Client, Collection, GatewayIntentBits, Events, Routes, AttachmentBuilder } from "discord.js";
import QuestionSlashCommand from './commands/slash/questions.js';
import TranscribeSlashCommand from './commands/slash/transcribe.js';
import SummarizeTranscriptSlashCommand from './commands/slash/summarizeTranscript.js';
import SummarizeArticleSlashCommand from './commands/slash/summarizeArticle.js';
import TranscribeMessageCommand from './commands/messageContext/transcribe.js';
import SummarizeTranscriptMessageCommand from './commands/messageContext/summarizeTranscript.js';
import { REST } from '@discordjs/rest';
import Ask from './commandsLogic/chatGPT.js';
import Respond from './commandsLogic/textOrFileResponse.js';
import Transcribe from './commandsLogic/whisper.js';
import Summarize from './commandsLogic/videoSummary.js';
import History from './commandsLogic/collectGPTHistory.js';
import Article from './commandsLogic/article.js'


dotenv.config();
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.BOT_CLIENT_ID;
const GUILD_ID = process.env.BOT_GUILD_ID;
const BOT_ID = process.env.BOT_USER_ID;
const rest = new REST({ version: '10' }).setToken(TOKEN);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});



client.on('interactionCreate', async (interaction) => {
    interaction.deferReply();
    const reply = await interaction.fetchReply();
    if (interaction.isChatInputCommand()) {
        console.log('Chat Command');
        var userMessage = interaction.options._hoistedOptions[0].value;
        if (interaction.commandName === 'question') {
            interaction.editReply(Respond(await Ask(userMessage, client)))
        } else if (interaction.commandName === 'transcribe') {
            interaction.editReply(Respond(await Transcribe(userMessage, client, true, reply)))
        } else if (interaction.commandName === 'summarize_video') {
            interaction.editReply(Respond(await Summarize(userMessage, client, true, reply) + "\n\n" + userMessage))
        } else if (interaction.commandName === 'summarize_article') {
            var customPromptParam = interaction.options._hoistedOptions[1];
            var customPrompt;
            if (customPromptParam === undefined) { customPrompt = "Summarize this text: " } else { customPrompt = customPromptParam.value };
            interaction.editReply(Respond(await Article(userMessage, customPrompt, client)))
        }
        interaction.fetchReply().then((replyMessage) => {
            console.log(replyMessage.id)
        })
    } else if (interaction.isMessageContextMenuCommand()) {
        const attachment = interaction.targetMessage.attachments.first().attachment
        if (interaction.commandName === 'transcribe') {
            interaction.editReply(Respond(await Transcribe(attachment, client, false, reply)))
        } else if (interaction.commandName === 'summarize_video') {
            interaction.editReply(Respond(await Summarize(attachment, client, false, reply)))
        }
    }
})


client.on('messageCreate', async (message) => {
    if (!message.author.bot && message.interaction == null && message.mentions.users.get(BOT_ID) != null && message.reference != null) {
        message.reply(await History(message, client))
    }
})

async function main() {
    const commands = [
        QuestionSlashCommand,
        TranscribeSlashCommand,
        SummarizeTranscriptSlashCommand,
        TranscribeMessageCommand,
        SummarizeTranscriptMessageCommand,
        SummarizeArticleSlashCommand
    ];
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });
        client.login(TOKEN);
    } catch (err) {
        console.log(err);
    }
}

main();

