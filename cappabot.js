import { register } from "./commands.js";
import { bitField } from "./utils.js";
import { db, saveDB } from "./app.js";

// Ping command interaction response
function pingCommand(res) {
	return res.send({
		type: 4,
		data: {
			// Reply with pong and a button to ping again
			content: "Pong!",
			components: [{
				type: 1,
				components: [{
					type: 2,
					style: 1,
					label: "Again!",
					custom_id: "ping again"
				}]
			}]
		}
	});
}

// Get a random reaction image from the https://github.com/CappaBot1/reactionImages github repo
async function getReactionImage() {
	let imageURLs = [];
	const response = (await fetch("https://api.github.com/repos/CappaBot1/reactionImages/contents", {method: "GET"}));
	
	let repoContents = await response.json();

	for (let i = 0; i < repoContents.length; i ++) {
		imageURLs.push("https://raw.githubusercontent.com/CappaBot1/reactionImages/refs/heads/main/" + repoContents[i].name);
	}

	return imageURLs[Math.floor(Math.random()*imageURLs.length)]
}

// The "brains" of Cappa Bot, handle interactions
export async function handleInteraction(req, res) {
    try {
        // Interaction type and data
        const body = req.body;
        const { type, data } = body;

        // Ping requests
        if (type == 1) {
            return res.send({ type: 1 });
        }

        // Slash command requests
        if (type == 2) {
            // Get the slash command name
            let { name } = data;

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
                                    style: 2,
                                    label: "Message",
                                    custom_id: "test message"
                                },
                                {
                                    type: 2,
                                    style: 2,
                                    label: "Modal",
                                    custom_id: "test modal"
                                }
                            ]
                        }]
                    }
                });
            }

            // "manage" command
            else if (name == "manage") {
                // Check if the person sending this command is the owner
                if (body.user.username == "cappabot") {
                    return res.send({
                        type: 4,
                        data: {
                            content: "Dashboard",
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 2,
                                            label: "Update",
                                            custom_id: "manage_update"
                                        },
                                        {
                                            type: 2,
                                            style: 2,
                                            label: "Save db",
                                            custom_id: "manage_save"
                                        }
                                    ]
                                }
                            ]
                        }
                    })
                }
                // Not the owner 🤬
                return res.send({
                    type: 4,
                    data: {
                        content: "You're not the owner 🤬",
                        flags: bitField(6)
                    }
                })
            }

            // "get" command
            else if (name == "get") {
                return res.send({
                    type: 4,
                    data: {
                        content: "What would you like to?",
                        components: [{
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Add to server/user",
                                    url: "https://discord.com/oauth2/authorize?client_id=" + process.env.APP_ID
                                },
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Join the official server",
                                    url: "https://discord.gg/HxThbHWG46"
                                },
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Check out the website",
                                    url: "https://comic-python-topical.ngrok-free.app/website"
                                }
                            ]
                        }]
                    }
                })
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

            // "how" command
            else if (name == "how") {
                return res.send({
                    type: 4,
                    data: {
                        // Reply with the reaction
                        content: "\
To use the best command ever made (`react`) follow these instructions:\n\
> 1. Make sure you have me installed (use the `/get` command)\n\
> 2. Right click on the **message** you would like to react to\n\
> 3. Go to the `apps` dropdown\n\
> 4. Click the `react` command next to my pfp\n\
> 5. Wait for the image to load and enjoy!\n\
You can try testing it out on this message now!\
                        "
                    }
                });
            }

            console.error(`unknown command: ${name}`);
            return res.status(400).json({ error: 'unknown command' });
        }

        // Component interactions
        else if (type == 3) {
            // Get the ID of the component interaction
            let { custom_id } = data;

            // The ping again button
            if (custom_id == "ping again") {
                return pingCommand(res);
            }

            // All of the manage buttons
            else if (custom_id.split("_")[0] == "manage") {
                // Split the name of the command up
                custom_id = custom_id.split("_").slice(1);

                // The update button will update the bots commands
                if (custom_id == "update") {
                    register();
                    return res.send({
                        type: 7,
                        data: {
                            content: "Probably `updated` idk"
                        }
                    })
                }

                // Save the database to storage
                else if (custom_id == "save") {
                    saveDB();
                    return res.send({
                        type: 7,
                        data: {
                            content: "Probably `saved db` idk"
                        }
                    })
                }
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
                let suggestions = "Suggestions:";
                for (let i = 0; i < db.suggestions.length; i ++) {
                    suggestions = `${suggestions}\n${i+1}) ${db.suggestions[i].title}\n        ${db.suggestions[i].description}`
                }
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
            let { custom_id, components } = data;

            // Get all of the inputs from the modal
            let inputs = [];
            let input = "";
            for (let i = 0; i < 5; i ++) {
                try {
                    input = components[i].components[0].value;
                } catch {
                    input = "";
                } finally {
                    inputs.push(input);
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
            else if (custom_id == "add suggestion") {
                // Add the suggestion
                db.suggestions.push({"title": inputs[0], "description": inputs[1]});
                
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
            return res.status(404).json({ error: "unknown customID" });
        }

        console.error("unknown interaction type", type);
        return res.status(404).json({ error: "unknown interaction type" });
    } catch (err) {
        console.error(err)
    }
}
