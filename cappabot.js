import 'dotenv/config';
import { verifyKeyMiddleware } from 'discord-interactions';
import { pingCommand, getReactionImage, bitField } from './utils.js';
import * as fs from 'node:fs';

// Starting message
console.log("----------------------------------------------------------------")
console.log("Starting CappaBot...");

export async function start(app) {
    /**
     * Interactions endpoint URL where Discord will send HTTP requests
     * Parse request body and verifies incoming requests using discord-interactions package
     */
    app.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
        // Interaction type and data
        const body = req.body;
        const { type, data } = body;

        //console.log(body);

        console.log(`Got interaction of type: ${type}`);

        // Ping requests
        if (type == 1) {
            return res.send({ type: 1 });
        }

        // Slash command requests
        if (type == 2) {
            // Get the slash command name
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
                        components: [{
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
                        }]
                    }
                });
            }

            // "react" command
            else if (name == "react") {
                return res.send({
                    type: 4,
                    data: {
                        // Reply with the reaction
                        content: await getReactionImage()
                    }
                });
            }

            // "suggestions" command
            else if (name == "suggestions") {
                console.log("Getting suggestion command");
                return res.send({
                    type: 4,
                    data: {
                        // Reply with a message with action buttons
                        content: "What do you want to do?",
                        components: [{
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 2,
                                    label: "Add suggestion",
                                    custom_id: "add suggestion modal"
                                },
                                {
                                    type: 2,
                                    style: 2,
                                    label: "View suggestions",
                                    custom_id: "view suggestions"
                                }
                            ]
                        }]
                    }
                });
            }

            console.error(`unknown command: ${name}`);
            return res.status(400).json({ error: 'unknown command' });
        }

        // Component interactions
        else if (type == 3) {
            // Get the ID of the component interaction
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
                        components: [{
                            type: 1,
                            components: [{
                                type: 4,
                                custom_id: "test text input",
                                label: "Test text",
                                style: 1,
                                placeholder: "Yeah, it worked",
                                required: true
                            }]
                        }]
                    }
                });
            }

            // Add suggestion button
            else if (custom_id == "add suggestion modal") {
                console.log("Suggestion modal")
                return res.send({
                    type: 9,
                    data: {
                        title: "Add suggestion",
                        custom_id: "add suggestion",
                        components: [
                            {
                                type: 1,
                                components: [{
                                    type: 4,
                                    custom_id: "suggestion_title",
                                    label: "Your suggestion",
                                    style: 1,
                                    placeholder: "Super cool suggestion name",
                                    required: true
                                }]
                            },
                            {
                                type: 1,
                                components: [{
                                    type: 4,
                                    custom_id: "suggestion_body",
                                    label: "Description",
                                    style: 2,
                                    placeholder: "Add X because Y...",
                                    required: false
                                }]
                            }
                        ]
                    }
                });
            }

            // View suggestions button
            else if (custom_id == "view suggestions") {
                console.log("Suggestions:", suggestions)
                return res.send({
                    type: 7,
                    data: {
                        content: suggestions
                    }
                });
            }

            console.error(`unknown customID: ${custom_id}`);
            return res.status(400).json({ error: 'unknown customID' });
        }

        // Modal submits
        else if (type == 5) {
            console.log(data)
            const { custom_id, components } = data

            let inputs = []
            let value = ""
            for (let i = 0; i < 5; i ++) {
                try {
                    value = components[0][i].value
                } catch {
                    value = ""
                } finally {
                    inputs.push(value)
                }
            }

            // The testing modal
            if (custom_id == "test modal submit") {
                // Send a message with what they inputted into the test text input
                return res.send({
                    type: 4,
                    data: {
                        // Reply with a message asking what to test
                        content: "Test text inputted in modal: " + inputs[0]
                    }
                });
            }

            // The add suggestion modal
            if (custom_id == "add suggestion") {
                let suggestion = `${inputs[0]}: ${inputs[1]}\n`

                // Append the suggestion to the file
                fs.appendFile("suggestions.txt", suggestion, "utf-8", (err) => {
                    if (err) {
                        throw err;
                    }
                    fs.readFile("suggestions.txt", "utf-8", (err, data) => {
                        if (err) {
                            throw err;
                        }
                        suggestions = data;
                    });
                });
                
                // Send an ephemeral thank you message
                return res.send({
                    type: 4,
                    data: {
                        // Reply with an ephemeral message asking what to test
                        content: "Thank you for your submission!",
                        flags: bitField(6)
                    }
                });
            }

            console.error("unknown customID:", custom_id);
            return res.status(400).json({ error: 'unknown customID' });
        }

        console.error("unknown interaction type", type);
        return res.status(400).json({ error: "unknown interaction type" });
    });
}