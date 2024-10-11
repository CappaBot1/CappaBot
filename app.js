import 'dotenv/config';
import express from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { pingCommand, getReactionImage } from './utils.js';
import { exec } from 'child_process'
import crypto from 'crypto'

// Suppress that random warning that keeps popping up
process.env.NODE_NO_WARNINGS = 'stream/web';

// Create an express app
const app = express();
// Get port, or default to 3000
const port = process.env.PORT || 3000;

// Check if CappaBot is working
app.get("/", function (req, res) {
	return res.send("CappaBot is up 👍");
});

// Use github webhooks for push requests so CappaBot can auto-update
app.post("/github", function (req, res) {
	console.log("Got request from github!");

	const requestBody = req.body
	console.log(requestBody);

	const realHash = Buffer.from(req.get("x-hub-signature-256") || '', 'utf8')
	console.log(realHash);
	const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
	console.log(hmac);
	const expectedHash = Buffer.from("sha256=" + hmac.update(requestBody).digest('hex'), 'utf8')

	console.log(expectedHash);

	if (realHash.length !== expectedHash.length || !crypto.timingSafeEqual(expectedHash, realHash)) {
		console.log("Request not verified")
		return res.send("Yeah nah.");
	} else {
		console.log("Request verified")
		exec("../update.sh",
			(error, stdout, stderr) => {
				console.log("Output:", stdout);
				console.log("Error:", stderr);
				if (error !== null) {
					console.log("exec error:", error);
				}
			});
		setTimeout(() => {process.exit(0)}, 5000);
		return res.send("Yeah man.");
	}
});

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
