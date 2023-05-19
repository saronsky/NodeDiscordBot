import dotenv from "dotenv";
dotenv.config();
const channelId = process.env.BOT_COST_CHANNEL_ID;

export default function sendPrize(client, recentCost, queryType) {
    recentCost = Number(recentCost.toFixed(6));
    const channel = client.channels.cache.get(channelId);
    channel.messages.fetch({ limit: 1 }).then(amount => {
        channel.send(queryType + " Cost: $" + String(recentCost) +
            "\nNew Total: $" + Number((parseFloat(String(amount.first()).split("New Total: $")[1]) + recentCost).toFixed(6)))
    })
}