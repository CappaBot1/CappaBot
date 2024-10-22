import 'dotenv/config';
import express from 'express';
import { exec } from 'child_process'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { verifyKeyMiddleware } from 'discord-interactions';
import fs from 'node:fs';

import { handleInteraction } from './cappabot.js';

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting Express App...");

var server;

// Load database
export var db = JSON.parse(fs.readFileSync("db.json"), "utf8") // Import the database

console.log("Database:", db);
console.log("Suggestions:", db.suggestions);

// Make a fake __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Define app port
const port = 6969;

// Create an express app
const app = express();

// Check if CappaBot is working
app.get("/", function (req, res) {
	console.log("Got get request to main site.");
	return res.send("CappaBot is up 👍");
});

// Get the status
app.get("/status", function (req, res) {
	return res.send("✅");
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
			(error, stdout, stderr) => {
				let updateStatus;
				console.log(stdout);
				if (stdout == "Already up to date.\n") {
					updateStatus = "I didn't update.";
				} else {
					fs.writeFile('db.json', JSON.stringify(db, undefined, 4), server.close);
					updateStatus = "I updated.";
				}
				return res.send("Yeah man. " + updateStatus);
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

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting CappaBot...");

app.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), handleInteraction);

// Start the express app
server = app.listen(port, () => {
	console.log("App listening on port", port);
});
