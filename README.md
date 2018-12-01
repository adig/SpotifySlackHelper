# Spotify Slack Helper

Simple nodejs Slack app that listens for links to Apple Music albums, artists or tracks and responds with the corresponding link for Spotify. 

## How it works

The service listens to the `link_shared` [Slack WebAPI event](https://api.slack.com/events/link_shared) that matches the configured App Unfurl Domains, in this case `itunes.apple.com`. 
⚠️ `links:read` Slack App Permission Scope is required for this. 

Using the id from the shared URL it fetches information about the track/album/artist using the iTunes API (see [https://github.com/fvdm/nodejs-searchitunes](https://github.com/fvdm/nodejs-searchitunes))

Using the metadata fetched from iTunes it queries the Spotify API for the equivalent item and shares it in the same channel. See [https://github.com/thelinmichael/spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node)
⚠️ `chat:write:bot` Slack App Permission Scope is required for this. 

**Note**: When using `link_shared` and **App Unfurl Domains** the classic Slack unfurl isn't displayed anymore. This service simulates the classic unfurl using the [Metascraper](http://metascraper.js.org/) library. 
⚠️ `links:write` Slack App Permission Scope is required for this to work. 

## Setup

1. Clone repo and `yarn install`
2. [Create a Slack app](https://api.slack.com/slack-apps)
    
    * Enable **Events Subscription** for your app [More](https://api.slack.com/events-api)
    * Subscribe to the `link_shared` event
    * Add `itunes.apple.com` to the **App Unfurl Domains**
    * Add `links:read`, `links:write` and `chat:write:bot` permission scopes
3. Create a Spotify App [here](https://developer.spotify.com/dashboard)
4. Add config as environment variables:
    * `SLACK_SIGNIN_SECRET` - Signing Secret in App Credentials
    * `SLACK_ACCESS_TOKEN` - OAuth Access Token
    * `SPOTIFY_CLIENT_ID`
    * `SPOTIFY_CLIENT_SECRET`
5. Start the app with `yarn start`
6. Add the Request URL in the Events Subscription page for your Slack App. The url will be `<EXTERNAL_URL>/client/events`. You can use [ngrok](https://ngrok.com) for local development
