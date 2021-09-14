const { SLACK_SIGNIN_SECRET, SLACK_ACCESS_TOKEN, TEST_ACCESS_TOKEN } = process.env;

const { WebClient } = require('@slack/client');
const { createEventAdapter } = require('@slack/events-api');

const slackEvents = createEventAdapter(SLACK_SIGNIN_SECRET, {
	waitForResponse: true,
	includeHeaders: true
});
const slackWebClient = new WebClient(SLACK_ACCESS_TOKEN);

const { processURLs } = require('../../src/_process-urls');

slackEvents.on('link_shared', (event, headers, respond) => {

	if(headers['x-slack-retry-num']) {
		return respond();
	}

	const links = event.links.map(link => link.url);
	
	processURLs(links)
	.then(responseLinks => {
		return Promise.all(
			responseLinks.map(link => {
				return slackWebClient.chat.postMessage({
					channel: event.channel,
					text: `Here's the Spotify version for that: ${link}`
				});
			})
		);
	})
	.then(() => {
		respond();
	})
	.catch(error => {
		console.error('ERROR:', error);
		respond(error, {
			failWithNoRetry: true
		});
	});
});

// Handle errors
slackEvents.on('error', (error) => {
	console.log('ERROR:', erorr);
});

module.exports = slackEvents.expressMiddleware();
