import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import fs, { readFileSync } from "fs";
import ytdl from "ytdl-core";
import Cost from './queryCost.js';
import got from 'got';
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegStatic)

dotenv.config();
const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
);

const MAX_FILE_SIZE = 1 * 1024 * 1024

async function transcribe(fileName, outputName) {
    const response = await openai.createTranscription(fs.createReadStream(fileName), 'whisper-1')
    fs.writeFileSync(outputName, response.data.text)
    console.log(outputName + " was saved!");
}

async function splitAndTranscribe(message, client, isYoutube, reply) {
    const mp3WriteStream = fs.createWriteStream('./video.mp3');
    var download;
    var transcriptFileNames = []
    if (!fs.existsSync('./transcripts/')) {
        fs.mkdirSync('./transcripts/')
    }
    const directory = './transcripts/' + reply.id;
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory)
    }
    if (!fs.existsSync('./splitAudio/')) {
        fs.mkdirSync('./splitAudio/')
    }
    if (isYoutube) {
        console.log("Starting Youtube download")
        const videoInfo = await ytdl.getInfo(message)
        const audioSize = videoInfo.formats[13].contentLength
        const videoLengthSeconds = videoInfo.videoDetails.lengthSeconds
        const numVideos = Math.ceil(audioSize / MAX_FILE_SIZE)
        download = ytdl(message, { filter: 'audioonly', quality: "highestaudio" });
        await new Promise((resolve) => { // wait
            download.pipe(mp3WriteStream)
                .on('close', () => {
                    console.log("Full Audio Downloaded");
                    resolve(); // finish
                })
        });
        Cost(client, videoLengthSeconds * 0.0001, "Transcription")
        const eachVideoLengthSeconds = videoLengthSeconds / numVideos;
        var promises = [];
        console.log("Start Splitting")
        for (let i = 0; i < numVideos; i++) {
            promises.push(new Promise((resolve) => {
                const fileName = './splitAudio/' + i + '.mp3'
                new ffmpeg('video.mp3')
                    .setStartTime(i * eachVideoLengthSeconds)
                    .setDuration(eachVideoLengthSeconds)
                    .output(fileName)
                    .on('end', async function (err) {
                        if (!err) {
                            console.log('Split ' + (i + 1) + ' Done of ' + numVideos);
                            const outputName = './transcripts/' + reply.id + '/' + i + '.txt'
                            await transcribe(fileName, outputName)
                            transcriptFileNames.push(outputName)
                            resolve()
                        }
                    })
                    .run();
            }))
        }
        await Promise.all(promises)
        console.log("Done Splitting")
    } else {
        const outputName = './transcripts/' + reply.id + '/' + 1 + '.txt'
        download = got.stream(message)
        await new Promise((resolve) => { // wait
            download.pipe(fs.createWriteStream('./video.mp3'))
                .on('close', () => {
                    resolve(); // finish
                })
        });
        await transcribe('./video.mp3', outputName)
        transcriptFileNames.push(outputName)
    }
    return transcriptFileNames
}

export default async function transcribeMain(message, client, isYoutube, reply) {
    var transcriptFileNames = await splitAndTranscribe(message, client, isYoutube, reply)
    console.log("Start Merge")
    const finalTranscriptFile = './transcripts/' + reply.id + '/final.txt'
    fs.writeFile(finalTranscriptFile, "", function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was created!");
    })
    for (let i = 0; i < transcriptFileNames.length; i++) {
        const transcriptFile = './transcripts/' + reply.id + '/' + i + '.txt';
        fs.appendFileSync(finalTranscriptFile, readFileSync(transcriptFile) + " ", function (err) {
            if (err) {
                return console.log(err);
            }
        })
        console.log("File "+i+" was appended!");
    }
    console.log("End Merge")
    return readFileSync(finalTranscriptFile, 'utf8')


}