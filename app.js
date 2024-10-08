import 'dotenv/config';
import express from 'express';
import {
	InteractionType,
	InteractionResponseType,
	verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, line } from './utils.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
	// Interaction type and data
	const { type, data } = req.body;

	console.log(`Got interaction of type: ${type}`)

	// Handle ping requests
	if (type == 1) {
		return res.send({ type: 1 });
	}

	/**
	 * Handle slash command requests
	 * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
	 */
	if (type === 2) {
		const { name } = data;

		// "ping" command
		if (name === 'ping') {
			// Send a message into the channel where command was triggered from
			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					// Reply with pong and a button to ping again
					content: "Pong!",
					components: [
						{
							"type": 1,
							"components": [
								{
									"type": 2,
									"style": 1,
									"label": "Again!",
									"custom_id": "ping again"
								}
							]
						}
					]
				}
			});
		}
		

		console.error(`unknown command: ${name}`);
		return res.status(400).json({ error: 'unknown command' });
	}

	// Component interactions like clicking on a button
	if (type === 3) {
		const { custom_id } = data

		if (custom_id == "ping again") {
			// Same code as above
			// Send a message into the channel where command was triggered from
			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					// Reply with pong and a button to ping again
					content: "Pong!",
					components: [
						{
							"type": 1,
							"components": [
								{
									"type": 2,
									"style": 1,
									"label": "Again!",
									"custom_id": "ping again"
								}
							]
						}
					]
				}
			});
		}
	}

	console.error('unknown interaction type', type);
	return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
	console.log('Listening on port', PORT);
});
