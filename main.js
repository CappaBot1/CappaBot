import 'dotenv/config';
import { DiscordRequest } from './utils.js';

console.log("Main is running...")

await DiscordRequest("get", `/applications/${process.env.APP_ID}/commands`, null, true)