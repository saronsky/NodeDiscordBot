import Ask from './chatGPT.js';
import Transcribe from './whisper.js'

export default async function summarize(message, client, isYoutube, reply) {
    var response = await Transcribe(message, client, isYoutube, reply)

    return String(
        await Ask(
            "Summarize this text using bullet points: " + response, client)
    )


}