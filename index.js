const { SLACK_SIGNIN_SECRET, SLACK_ACCESS_TOKEN, TEST_ACCESS_TOKEN } = process.env;

const { WebClient } = require('@slack/client');
const { createEventAdapter } = require('@slack/events-api');

const http = require('http');
const express = require('express');
const app = express();


const slackEvents = createEventAdapter(SLACK_SIGNIN_SECRET);
const slackWebClient = new WebClient(SLACK_ACCESS_TOKEN);

const { processURLs, searchitunes, searchSpotify } = require('./src/process-urls');
const unfurl = require('./src/unfurl');

const port = process.env.PORT || 3000;

app.get('/test', (req, res) => {

	const { token, url } = req.query;

	if(token != TEST_ACCESS_TOKEN) {
		return res.status(500).end();
	}

	if(!url.trim()) {
		return res.status(400).end();
	}

	processURLs([url])
	.then((response => {
		res.json(response).end();
	}))
	.catch(err => {
		console.error(err);
		res.status(500).end();
	})
});

app.get('/test-spotify', (req, res) => {

	const { type, query, market, token } = req.query;

	if(token != TEST_ACCESS_TOKEN) {
		return res.status(500).end();
	}

	searchSpotify(type, query, market)
	.then((response => {
		res.json(response).end();
	}))
	.catch(err => {
		console.error(err);
		res.status(500).send(err).end();
	})
});

app.get('/test-itunes', (req, res) => {

	const { id, token } = req.query;

	if(token != TEST_ACCESS_TOKEN) {
		return res.status(500).end();
	}

	searchitunes({ id })
	.then((response => {
		res.json(response).end();
	}))
	.catch(err => {
		console.error(err);
		res.status(500).send(err).end();
	})
});

app.use('/slack/events', slackEvents.expressMiddleware());

slackEvents.on('link_shared', event => {

	const links = event.links.map(link => link.url);

	unfurl(links)
	.then(metadata => {

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

// Start the express application
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
