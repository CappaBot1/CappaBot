import 'dotenv/config';
import 'readline'

export async function DiscordRequest(endpoint, options) {
	// Add the endpoint to the api url
	const url = 'https://discord.com/api/v10/' + endpoint;

	// Stringify the json payload
	if (options.body) options.body = JSON.stringify(options.body);

	// Make the request with fetch and return the result
	const res = await fetch(url, {
		headers: {
			Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			'Content-Type': 'application/json'
		},
		...options
	});

	// If there was an error, throw it
	if (!res.ok) {
		const data = await res.json();
		console.log(`Error: ${res.status}: ${res.statusText}`);
		throw new Error(JSON.stringify(data));
	}

	// Return the response
	return res;
}

export async function InstallGlobalCommands(appId, commands) {
	// API endpoint to overwrite global commands
	const endpoint = `applications/${appId}/commands`;

	try {
		// This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
		await DiscordRequest(endpoint, { method: 'PUT', body: commands });
	} catch (err) {
		console.error(err);
	}
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
	const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
	return emojiList[Math.floor(Math.random() * emojiList.length)];
}

// Capitalize the first letter of a string
export function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// Print a line across the terminal
export function line() {
	console.log("--------------------------------------------------")
}

// Ask a question in the terminal and wait for answer
export function askQuestion(query) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise(resolve => rl.question(query, ans => {
		rl.close();
		resolve(ans);
	}))
}