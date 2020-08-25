const slackHandler = require('./api/slack/events');

const testHandler = require('./src/_test');
const testSpotifyHandler = require('./src/_test-spotify');
const testiTunesHandler = require('./src/_test-itunes');

app.get('/test', testHandler);

app.get('/test-spotify', testSpotifyHandler);

app.get('/test-itunes', testiTunesHandler);

app.use('/slack/events', slackHandler);

// Start the express application
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
