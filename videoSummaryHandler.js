import Ask from './chatGPTHandler.js';
import Transcribe from './whisperHandler.js'

export default async function summarize(message, client, isYoutube, reply) {
    var response = await Transcribe(message, client, isYoutube, reply)

    return String(
        await Ask(
            "Summarize this text using bullet points: " + response, client)
    )


}