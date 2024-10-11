import 'dotenv/config';
import { DiscordRequest } from './utils.js';

console.log("Main is running")

//await DiscordRequest("post", `/channels/1235783364204822580/messages`, {content: await getReactionImage()}, true)

/*
let bungers = []
let bunger = await DiscordRequest("get", `/applications/${process.env.APP_ID}/commands`)

for (let i = 0; i < bunger.length; i ++) {
    bungers.push(bunger[i].id);
}

console.log(bungers)
*/