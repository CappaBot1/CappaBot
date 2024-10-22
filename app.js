import "dotenv/config";
import express from "express";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { verifyKeyMiddleware } from "discord-interactions";
import fs from "node:fs";
import crypto from "crypto";
import bodyParser from "body-parser"

import { handleInteraction } from "./cappabot.js";
import { noCircular } from "./utils.js";

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting Express App...");

var server;

// Import and load database
export var db = JSON.parse(fs.readFileSync("db.json"), "utf8");

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

// Github and stuff
const sigHeaderName = 'X-Hub-Signature-256'
const sigHashAlg = 'sha256'

app.use("/github", bodyParser.json({
	verify: (req, res, buf, encoding) => {
		console.log("Makig raw body");
		if (buf && buf.length) {
			req.rawBody = "something or rather"//buf.toString(encoding || 'utf8');
		}
	}
}));

function verifyPostData(req, res, next) {
	console.log("Github verification coming in???");

	console.log("Request body:", req.rawBody);
	if (!req.rawBody) {
	  return next('Request body empty');
	}
  
	const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
	console.log("Sig:", sig);
	const hmac = crypto.createHmac(sigHashAlg, process.env.GITHUB_WEBHOOK_SECRET);
	console.log("Hmac:", hmac);
	const digest = Buffer.from(sigHashAlg + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8');
	console.log("Digest:", digest);
	if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
		console.log("Request probably verified but idk");
	  	return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`);
	}
	console.log("Request might have been verified but idk");
	return next()
}

app.post("/github", verifyPostData, function (req, res) {
	console.log("Request verified.");
	exec("git pull", (error, stdout, stderr) => {
		// Log the git output
		console.log(stdout);

		// Default to not updating
		let updateStatus = "I didn't update.";

		// Check if we actually need to update
		if (!stdout == "Already up to date.\n") {
			updateStatus = "I updated.";

			// Write the database to storage for next time
			if (db) {
				fs.writeFile('db.json', JSON.stringify(db, undefined, 4), () => {server.close()});
			} else {
				console.log("Database lost?");
			}
		}
		console.log(updateStatus);
		return res.send("Yeah man." + updateStatus);
	});
});

app.use("/github", (err, req, res, next) => {
	if (err) console.error(err)
	console.log("Prob not github here.")
	res.status(403).send("Request body was not signed or verification failed.");
});

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting CappaBot...");

app.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), handleInteraction);

// Start the express app
server = app.listen(port, () => {
	console.log("App listening on port", port);
});
