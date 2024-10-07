import * as readline from 'readline'
import * as dotenv from 'dotenv'

console.log("Starting testing.js...")
line()

dotenv.config()
const token = process.env.BOT_TOKEN
console.log("Token: " + token)
const apiVersion = "v10/" // can be something like "v10/" or just blank ""

// Headers with the bot token for authentification
const headers = {
    "Authorization": `Bot ${token}`,
    "Content-Type": "application/json"
}

await doRequest("/channels/1250923264210112774/typing", "POST")

const message = await askQuestion("message to send in bot dm's: ");
await sendMessage(1250923264210112774n, message)

// Send a message in a channel
async function sendMessage(channel, message) {
    await doRequest(`/channels/${channel}/messages`, "POST", { "content": message })
}

// Do a request
async function doRequest(discordURL, method, payload) {
    // Fetch the thing from the discord API
    const response = await fetch("https://discord.com/api" + apiVersion + discordURL, {
        method: method.toUpperCase(),
        body: JSON.stringify(payload),
        headers: headers
    });
    
    // Print and return the response status
    console.log(response.status + ": " + response.statusText)
    return response
}

// Ask a question in the terminal
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

// Print a line across the terminal
function line() {
    console.log("--------------------------------------------------")
}