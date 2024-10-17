import 'dotenv/config';
import express from 'express';
import { exec } from 'child_process'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { start } from './cappabot.js';

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting Express App...");

var server;

// Make a fake __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Define app port
const port = 8080;

// Create an express app
const app = express();

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

// Start Cappa Bot
try {
	start(app);
} catch (err) {
	console.log("Error:", err);
}

// Start the express app
server = app.listen(port, () => {
	console.log("App listening on port", port);
});
