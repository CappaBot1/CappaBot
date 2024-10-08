import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Ping command
const PING_COMMAND = {
	name: 'ping',
	description: 'Ping the server',
	type: 1,
	integration_types: [0, 1]
};

const ALL_COMMANDS = [PING_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);