import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';


const ALL_COMMANDS = [
	// Ping command
	{
		name: "ping",
		description: "Ping the server",
		type: 1,
		integration_types: [0, 1]
	},

	// Test command
	{
		name: "test",
		description: "Give some buttons for testing the bot",
		type: 1,
		integration_types: [0, 1]
	}
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);