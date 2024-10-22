import 'dotenv/config';
import express from 'express';
import { exec } from 'child_process'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { verifyKeyMiddleware } from 'discord-interactions';
import fs from 'node:fs';

import { handleInteraction } from './cappabot.js';
import { noCircular } from './utils.js';

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting Express App...");

var server;

// Import and load database
export var db = JSON.parse(fs.readFileSync("db.json"), "utf8")

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
					updateStatus = "I updated.";
					fs.writeFile('db.json', JSON.stringify(db, undefined, 4), () => {server.close()});
				}
				return res.send("Yeah man." + updateStatus);
			});
	} else {
		console.log("Request not verified.");
		return res.status(401).send("Yeah nah.");
	}
});

// Function used to verify if /github is being POSTed by the real github
function verifyGithub(req) {
	// Verifying message
	console.log("----------------------------------------------------------------");
	console.log("Verifying payload...");
	
	if (!req.headers['user-agent'].includes('GitHub-Hookshot')) {
		return false;
	}

	let payload = req;
	console.log(JSON.stringify(payload, noCircular(payload)));
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
