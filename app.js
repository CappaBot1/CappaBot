import fs from "node:fs";
//import crypto from "node:crypto";
import process from "node:process";
//import { exec } from "node:child_process";
//import { Buffer } from "node:buffer";

//import "npm:dotenv/config";
import express from "npm:express";
//import bodyParser from "npm:body-parser";
import { verifyKeyMiddleware } from "npm:discord-interactions";

import { handleInteraction } from "./cappabot.js";

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting Express App...");

// Import and load database
// deno-lint-ignore no-var
export var db = JSON.parse(fs.readFileSync("db.json"), "utf8");

// Save db function
export function saveDB(callback) {
    fs.writeFile(
        "db.json",
        JSON.stringify(db, undefined, 4),
        callback ??= () => {
            console.log("Saved database.");
        },
    );
}

// Make a fake __dirname
const __dirname = Deno.cwd();

// Define app port
const port = 51243;

// Create an express app
const app = express();
//var server;

// Check if CappaBot is working
app.get("/", function (_req, res) {
    return res.send("Cappa Bot is up 👍");
});

// Github and stuff
//const sigHeaderName = "X-Hub-Signature-256";
//const sigHashAlg = "sha256";

/*app.use(
    "/github",
    bodyParser.json({
        verify: (req, _res, buf, encoding) => {
            console.log("Making raw body");
            if (buf && buf.length) {
                req.rawBody = buf.toString(encoding || "utf8");
            }
        },
    }),
);*/

/*function verifyPostData(req, _res, next) {
    console.log("Something's posting to github...");

    if (!req.rawBody) {
        return next("Request body empty.");
    }

    const sig = Buffer.from(req.get(sigHeaderName) || "", "utf8");
    const hmac = crypto.createHmac(
        sigHashAlg,
        process.env.GITHUB_WEBHOOK_SECRET,
    );
    const digest = Buffer.from(
        sigHashAlg + "=" + hmac.update(req.rawBody).digest("hex"),
        "utf8",
    );
    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        console.log("Request not verified.");
        return next(
            `Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`,
        );
    }
    console.log("Request verified.");
    return next();
}*/

/*app.post("/github", verifyPostData, function (_req, res) {
    // Pull from the github repo at https://github.com/CappaBot1/CappaBot
    exec("git pull", (_error, stdout) => {
        // Log the git output
        console.log(stdout);

        // Default to not updating
        let updateStatus = "I didn't update.";

        // Check if we actually need to update
        if (!stdout == "Already up to date.\n") {
            updateStatus = "I updated.";

            // Write the database to storage for next time
            if (db) {
                saveDB(() => {
                    server.close();
                });
            } else {
                console.log("Database lost?");
            }
        }
        // Show the update status
        console.log(updateStatus);
        return res.send("Yeah man." + updateStatus);
    });
});*/

/*app.use("/github", (err, _req, res) => {
    if (err) console.error(err);
    console.log("Request body was not signed or verification failed.");
    res.status(403).send("Request body was not signed or verification failed.");
});*/

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting CappaBot...");

app.post(
    "/interactions",
    verifyKeyMiddleware(process.env.PUBLIC_KEY),
    handleInteraction,
);
app.get("/interactions", function (_req, res) {
    console.log("Interactions get");
    return res.send("gup (interactions are working)");
});

// Start the express app
app.listen(port, () => {
    console.log("App listening on port", port);
});
