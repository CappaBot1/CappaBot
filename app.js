import fs from "node:fs";

import express from "npm:express";
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

// Starting message
console.log("----------------------------------------------------------------");
console.log("Starting CappaBot...");

// Discord endpoint
app.post(
    "/",
    verifyKeyMiddleware(Deno.env.get("PUBLIC_KEY")),
    handleInteraction,
);

// Get endpoint
app.get("/", function (_req, res) {
    return res.send("gup (bot is running)");
});

// Start the express app
app.listen(port, () => {
    console.log("App listening on port", port);
});
