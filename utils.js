import 'dotenv/config';

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

// Install application commands globally
export async function InstallGlobalCommands(commands) {
	let appId = process.env.APP_ID
	try {
		// This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
		await DiscordRequest("PUT", `/applications/${appId}/commands`, commands);
	} catch (err) {
		console.error(err);
	}
}

// Make a bitfield from an array, number, or string of numbers
export function bitField(bits) {
	// Convert stuff to array format
	if (typeof bits == "number") bits = bits.toString();
	if (typeof bits == "string") bits = bits.split("");

	let result = 0
	for (let i = 0; i < bits.length; i ++) {
		result += 1 << bits[i];
	}
	return result
}

// Stop circular objects
export function noCircular(obj) {
	var i = 0;
	
	return function(key, value) {
	  if(i !== 0 && typeof(obj) === 'object' && typeof(value) == 'object' && obj == value) 
		return '[Circular]'; 
	  
	  if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
		return '[Unknown]';
	  
	  ++i; // so we know we aren't using the original object anymore
	  
	  return value;  
	}
  }