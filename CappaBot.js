import * as readline from 'readline'
import * as dotenv from 'dotenv'

// The start of CappaBot.js
console.log("Starting CappaBot.js...")
line()

// Initialize the .env file
dotenv.config()

// Get the bot token
const token = process.env.BOT_TOKEN
if (token == undefined) {
    throw "Token not defined!"
}

// Get the appID
const appID = process.env.APP_ID
if (appID == undefined) {
    throw "AppID not defined!"
}

// Print the first and last 4 digits of the token
console.log("First and last bits of token: " + token.slice(0, 4) + " ... " + token.slice(-4))
const apiVersion = "/v10" // can be something like "v10/" or just blank ""

// Headers with the bot token for authentification
const headers = {
    "Authorization": `Bot ${token}`,
    "Content-Type": "application/json"
}

line()
//----------------------------------------------------------------------------------------------------
// Utility functions

// Print a line across the terminal
function line() {
    console.log("--------------------------------------------------")
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

//----------------------------------------------------------------------------------------------------
// Discord functions

// Do a request
async function doRequest(method, discordURL, payload) {
    // Fetch the thing from the discord API
    const response = await fetch("https://discord.com/api" + apiVersion + discordURL, {
        method: method.toUpperCase(),
        body: JSON.stringify(payload),
        headers: headers
    });
    
    if (!response.ok) {
        // Print the response status
        console.log(response.status + ": " + response.statusText)
        if (response.status == 401) {
            throw "Token prob invalid smh."
        } else if (response.status == 403) {
            throw "You don't have permissions smh."
        } else if (response.status == 429) {
            throw "Rate limited lol"
        } else {
            throw "Something went wrong but even I don't know how to help with this one 🤷"
        }
    }

    // Get the rate limit headers
    console.log("Rate-limit reset after: " + response.headers.get("x-ratelimit-reset-after"))
    console.log("Rate-limit limit: " + response.headers.get("x-ratelimit-limit"))
    console.log("Rate-limit remaining: " + response.headers.get("x-ratelimit-remaining"))
    console.log("Rate-limit bucket: " + response.headers.get("x-ratelimit-bucket"))
    
    try {
        return await response.json()
    } catch {
        return {}
    }
}

class CappaBot {
    // Send a message in a channel
    async sendMessage(channel, content) {
        await doRequest("POST", `/channels/${channel}/messages`, {"content": content})
    }

    // Edit a message in a channel
    async editMessage(channel, message, content) {
        await doRequest("PATCH", `/channels/${channel}/messages/${message}`, {"content": content})
    }

    // Add reaction to message
    async addReaction(channel, message, emoji) {
        await doRequest("PUT", `/channels/${channel}/messages/${message}/reactions/${emoji}/@me`)
    }

    // Delete reaction to message
    async deleteReaction(channel, message, emoji) {
        await doRequest("DELETE", `/channels/${channel}/messages/${message}/reactions/${emoji}/@me`)
    }
}

//----------------------------------------------------------------------------------------------------

var cappaBot = new CappaBot()

/*
let runSeconds = 8 * 60
let intervalSeconds = 1.5

let loopCount = runSeconds / intervalSeconds

for (let i = 0; i < loopCount; i ++) {
    setTimeout(async function() {
        let date = new Date()
        let epoch = date.getTime()
        await cappaBot.editMessage("1241305927899152455", "1292777205926989875", "I'm alive! Epoch (ms): " + epoch)
        console.log("Epoch (ms): " + epoch)
        line()
    }, i * intervalSeconds * 1000)
}*/