import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';


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
		name: "suggestions",
		description: "View and submit suggestions using this command!"
	},
	{
		type: 3,
		name: "react",
		integration_types: [0, 1]
	}
];

InstallGlobalCommands(ALL_COMMANDS);