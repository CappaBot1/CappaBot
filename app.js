import 'dotenv/config';
import express from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { pingCommand, getReactionImage } from './utils.js';
import { exec } from 'child_process'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto'

// Starting message
console.log("Starting CappaBot...");

// Make a fake __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Suppress that random warning that keeps popping up
process.env.NODE_NO_WARNINGS = 'stream/web';

// Create an express app
const app = express();
// Get port, or default to 3000
const port = process.env.PORT || 3000;

// Check if CappaBot is working
app.get("/", function (req, res) {
	console.log("Got get request to main site.");
	return res.send("CappaBot is up 👍");
});

// The website portion of CappaBot
app.get("/website", function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

// Pico min stylesheet
app.get("/pico.min.css", function (req, res) {
	res.sendFile(__dirname + "/pico.min.css");
});

// Use github webhooks for push requests so CappaBot can auto-update
app.post("/github", function (req, res) {
	console.log("Got request from github (maybe).");

	if (verifyGithub(req)) {
		console.log("Request verified.");
		exec("git pull",
			() => {
				server.close();
				setTimeout(() => {console.log("Test"), 5000})
				return res.send("Yeah man.");
			});
	} else {
		console.log("Request not verified.");
		return res.status(401).send("Yeah nah.");
	}
});

// Function used to verify if /github is being POSTed by the real github
function verifyGithub(req) {
	if (!req.headers['user-agent'].includes('GitHub-Hookshot')) {
		return false;
	}

	// Compare their hmac signature to our hmac signature
	// (hmac = hash-based message authentication code)
	//const theirSignature = req.headers['x-hub-signature'];
	const payload = JSON.stringify(req.body);
	//const secret = String(process.env.GITHUB_WEBHOOK_SECRET);
	//const ourSignature = `sha1=${crypto.createHmac('sha1', secret).update(payload).digest('hex')}`;
	//return crypto.timingSafeEqual(Buffer.from(theirSignature), Buffer.from(ourSignature));
	console.log(payload);
	return true
}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
	// Interaction type and data
	const { type, data } = req.body;

	console.log(`Got interaction of type: ${type}`);

	// Handle ping requests
	if (type == 1) {
		return res.send({ type: 1 });
	}

	/**
	 * Handle slash command requests
	 * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
	 */
	if (type == 2) {
		const { name } = data;

		// "ping" command
		if (name == "ping") {
			return pingCommand(res);
		}

		// "test" command
		else if (name == "test") {
			return res.send({
				type: 4,
				data: {
					// Reply with a message asking what to test
					content: "What would you like to test?",
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									style: 3,
									label: "Message",
									custom_id: "test message"
								},
								{
									type: 2,
									style: 3,
									label: "Modal",
									custom_id: "test modal"
								}
							]
						}
					]
				}
			});
		}

		// "react" command
		else if (name == "react") {
			console.log("Reacting to message")
			return res.send({
				type: 4,
				data: {
					// Reply with the reaction
					content: await getReactionImage()
				}
			});
		}

		console.error(`unknown command: ${name}`);
		return res.status(400).json({ error: 'unknown command' });
	}

	// Component interactions like clicking on a button
	else if (type == 3) {
		const { custom_id } = data
		// The ping again button
		if (custom_id == "ping again") {
			return pingCommand(res);
		}

		// Test message button
		else if (custom_id == "test message") {
			return res.send({
				type: 4,
				data: {
					// Reply with a test message
					content: "Yup, the test message worked"
				}
			});
		}

		// Test modal button
		else if (custom_id == "test modal") {
			return res.send({
				type: 9,
				data: {
					// Reply with a test modal
					title: "Yup, the test modal worked",
					custom_id: "test modal submit",
					components: [
						{
							type: 1,
							components: [
								{
									type: 4,
									custom_id: "test text input",
									label: "Test text",
									style: 1,
									placeholder: "Yeah, it worked",
									required: true
								}
							]
						}
					]
				}
			});
		}

		console.error(`unknown customID: ${custom_id}`);
		return res.status(400).json({ error: 'unknown customID' });
	}

	// Modal submits
	else if (type == 5) {
		const { custom_id, components } = data

		let component = components[0].components

		// The testing modal
		if (custom_id == "test modal submit") {
			// Send a message with what they inputted into the test text input
			return res.send({
				type: 4,
				data: {
					// Reply with a message asking what to test
					content: "Test text inputted in modal: " + component[0].value,
				}
			});
		}

		console.error(`unknown customID: ${custom_id}`);
		return res.status(400).json({ error: 'unknown customID' });
	}

	console.error('unknown interaction type', type);
	return res.status(400).json({ error: 'unknown interaction type' });
});

// Start the express app
var server = app.listen(port, () => {
	console.log('Listening on port', port);
});

// Start ngrok if not using raspberry pi
if (process.env.USING_RPI == "false" || process.env.USING_RPI == undefined) {
	import('@ngrok/ngrok')
	.then((ngrok) => {
		(async function() {
		    console.log("Initializing Ngrok tunnel...");
		
		    const listener = await ngrok.forward({
				addr: port,
				domain: process.env.NGROK_DOMAIN || "",
				authtoken: process.env.NGROK_TOKEN || ""
			});
		  	console.log(`Ingress established at: ${listener.url()}`);
		})();
	})
}
