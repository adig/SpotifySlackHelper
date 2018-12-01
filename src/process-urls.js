const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const url = require('url');

const Spotify = require('node-spotify-api');
const searchitunes = require ('searchitunes');
const spotify = new Spotify({
  id: SPOTIFY_CLIENT_ID,
  secret: SPOTIFY_CLIENT_SECRET
});

const ALBUM_REGEX = /(.*)\/album\/(.*)\/(.[0-9]+)/;
const ARTIST_REGEX = /(.*)\/artist\/(.*)\/(.[0-9]+)/;
const REPLACE_ALBUM_NAME_REGEX = /EP|SINGLE/g;

function getAlbumURL(query) {

	return spotify.search({ type: 'album', query: query.replace(REPLACE_ALBUM_NAME_REGEX, '') })
		.then(response => response.albums.items.length ? response.albums.items[0].external_urls.spotify : null);

}

function getArtistURL(query) {

	return spotify.search({ type: 'artist', query: query })
		.then(response => response.artists.items.length ? response.artists.items[0].external_urls.spotify : null);

}

function getTrackURL(query) {

	return spotify.search({ type: 'track', query: query })
		.then(response => response.tracks.items.length ? response.tracks.items[0].external_urls.spotify : null);

}

function processURL(linkURL) {

	const { path, query } = url.parse(linkURL, { parseQueryString: true });

	if(ALBUM_REGEX.test(path) && query.i) {

		return searchitunes({id: query.i})
			.then(response => getTrackURL(response.trackName));

	} else if(ALBUM_REGEX.test(path)) {

		const match = ALBUM_REGEX.exec(path);
		const trackId = match[3];

		return searchitunes({id: trackId})
			.then(response => getAlbumURL(response.collectionName));

	} else if(ARTIST_REGEX.test(path)) {

		const match = ARTIST_REGEX.exec(path);
		const artistId = match[3];

		return searchitunes({id: artistId})
			.then(response => getArtistURL(response.artistName));

	}

	return null;
}

module.exports = function processURLs(urls) {
	return Promise
		.all(urls.map(processURL))
		.then(results => results.filter(result => !!result));
};