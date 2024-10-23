import "dotenv/config";

export async function discordRequest(method, endpoint, payload, logResponse) {
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
