import 'dotenv/config';
import { getRandomEmoji, line, DiscordRequest } from './utils.js';

/*
let response = await DiscordRequest(`/applications/${process.env.APP_ID}/commands`
    , {method: "GET"})

console.log(await response.json())
*/

// await DiscordRequest(`/applications/${1236147868910489680}/commands/1293025535332581477`, {method: "DELETE"})