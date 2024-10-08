import 'dotenv/config';
import { DiscordRequest, getReactionImage } from './utils.js';

console.log("Main is running...")

await DiscordRequest("post", `/channels/1235783364204822580/messages`, {content: await getReactionImage()}, true)