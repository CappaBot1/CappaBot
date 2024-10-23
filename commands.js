import "dotenv/config";

import { discordRequest } from "./utils.js";

export async function register() {
	console.log("Registering commands...");

	// Define all of the commands to show to the end user
	const ALL_COMMANDS = [
		{
			name: "ping",
			description: "Ping the server"
		},
		{
			name: "test",
			description: "Give some buttons for testing the bot"
		},
		{
			name: "manage",
			description: "Manage Cappa Bot (owner only)",
			contexts: [1]
		},
		{
			name: "suggestions",
			description: "View and submit suggestions using this command!"
		},
		{
			type: 3,
			name: "react",
			integration_types: [0, 1],
			contexts: [0, 1, 2]
		},
		{
			name: "get",
			description: "Add this bot to your server/user and also get information about it"
		},
		{
			name: "how",
			description: "Show a helpful tutorial message on how to use the most popular command. \"react\""
		}
	];

	// Register application commands globally
	try {
		// This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
		await discordRequest("PUT", `/applications/${process.env.APP_ID}/commands`, ALL_COMMANDS);
	} catch (err) {
		console.error(err);
	}
	
	console.log("Commands registered.");
}
