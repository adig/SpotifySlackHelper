require('console-stamp')(console);

const { SLACK_SIGNIN_SECRET, SLACK_ACCESS_TOKEN } = process.env;

const { WebClient } = require('@slack/client');
const { createEventAdapter } = require('@slack/events-api');

const slackEvents = createEventAdapter(SLACK_SIGNIN_SECRET);
const slackWebClient = new WebClient(SLACK_ACCESS_TOKEN);

const processURLs = require('./src/process-urls');
const unfurl = require('./src/unfurl');

const port = process.env.PORT || 3000;

slackEvents.on('link_shared', event => {

	const links = event.links.map(link => link.url);
	
	unfurl(links)
	.then(metadata => {
		console.log(metadata);
		let unfurls = {};
		
		links.forEach((link, i) => {
			unfurls[link] = metadata[i];
		});

		return slackWebClient.chat.unfurl({
			channel: event.channel,
			ts: event.message_ts,
			unfurls
		});
	})
	.then(response => {
		return processURLs(links);
	})
	.then(responseLinks => {
		console.log('corresponding links', responseLinks);
		return Promise.all(
			responseLinks.map(
				link => slackWebClient.chat.postMessage({
					channel: event.channel,
					text: `Here's the Spotify version for that: ${link}`
				})
			)
		);
	})
	.catch(error => console.error);
});

// Handle errors
slackEvents.on('error', console.error);

// Start a basic HTTP server
slackEvents.start(port).then(() => {
	console.log(`Started service on port ${port}...`);
});