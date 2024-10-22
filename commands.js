import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

export function register() {
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
			name: "update",
			description: "Update the global bot commands (owner only)",
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
	
	// Register the commands
	InstallGlobalCommands(ALL_COMMANDS);
	console.log("Commands registered.");
}
