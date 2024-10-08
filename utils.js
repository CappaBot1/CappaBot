import 'dotenv/config';
import 'readline'

export async function DiscordRequest(method, endpoint, payload, logResponse) {
	// Add the endpoint to the api url
	const url = 'https://discord.com/api/v10' + endpoint;

	// Stringify the json payload
	if (payload) payload.body = JSON.stringify(payload);

	// Make the request with fetch and return the result
	const res = await fetch(url, {
		method: method.toUpperCase(),
		headers: {
			Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			'Content-Type': 'application/json'
		},
		...payload
	});

	// If there was an error, throw it
	if (!res.ok) {
		const data = await res.json();
		console.log("Error", res.status, res.statusText);
		throw new Error(JSON.stringify(data));
	}

	if (logResponse) {
		console.log(await res.json())
	} else {
		// Return the response
		return await res.json();
	}
	
}

export async function InstallGlobalCommands(appId, commands) {
	try {
		// This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
		await DiscordRequest("PUT", `/applications/${appId}/commands`, commands);
	} catch (err) {
		console.error(err);
	}
}

// Ping command interaction response
export function pingCommand(res) {
	return res.send({
		type: 4,
		data: {
			// Reply with pong and a button to ping again
			content: "Pong!",
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							style: 1,
							label: "Again!",
							custom_id: "ping again"
						}
					]
				}
			]
		}
	});
}

// Get a random reaction image from the reactionImages github repo
export async function getReactionImage() {
	const repoTree = await fetch("https://api.github.com/repos/CappaBot1/reactionImages/git/trees/main").tree
	let imageNames = []

	for (let file in repoTree) {
		imageNames.push(file.url)
	}

	console.log(`Found ${imageNames.length} reaction images in the github repo`)
	let chosenImage = imageNames[Math.floor(Math.random()*imageNames.length)]
	console.log("Chosen image:", chosenImage)
	return chosenImage
}