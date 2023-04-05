import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import fs from "fs";
import ytdl from "ytdl-core";
import getVideoDurationInSeconds from "get-video-duration";
import Cost from './queryCostHandler.js';
import got from 'got';

dotenv.config();
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
);

export default async function transcribe(message, client, isYoutube, reply) {
    const mp3WriteStream = fs.createWriteStream('./video.mp3');
    var download;

    if (isYoutube) {
        download = ytdl(message, { filter: 'audioonly', quality: "lowestaudio" });
        Cost(client, (await ytdl.getInfo(message)).videoDetails.lengthSeconds * 0.0001, "Transcription")
    } else {
        download = got.stream(message)
    }

    await new Promise((resolve) => { // wait
        download.pipe(mp3WriteStream)
            .on('close', () => {
                resolve(); // finish
            })
    });

    const response = await openai.createTranscription(fs.createReadStream('./video.mp3'), 'whisper-1');
    const text=response.data.text
    fs.writeFile('./transcripts/'+reply.id+'.txt',text, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
    return text
}