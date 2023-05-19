//Manages Discord message length limit
//If text is over the limit, returns it in the form of a text file
import { AttachmentBuilder } from "discord.js";
export default function respond(message) {
    var response
    if (message.length >= 2000) {
        response = {
            files: [new AttachmentBuilder(Buffer.from(message), { name: 'file.txt' })]
        }
    }
    else { response = { content: String(message) } }
    return response
}