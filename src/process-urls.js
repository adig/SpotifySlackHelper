const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const url = require('url');
const querystring = require('querystring');

const Spotify = require('node-spotify-api');
const searchitunes = require ('searchitunes');
const spotify = new Spotify({
  id: SPOTIFY_CLIENT_ID,
  secret: SPOTIFY_CLIENT_SECRET
});

const SPOTIFY_SEARCH_URI = "https://api.spotify.com/v1/search";
const ALBUM_REGEX = /\/(.*)\/album\/(.*)\/(.[0-9]+)/;
const ARTIST_REGEX = /\/(.*)\/artist\/(.*)\/(.[0-9]+)/;
const REPLACE_ALBUM_NAME_REGEX = /ep|single/ig;
const REPLACE_DELIIMITER_CHARTS = /(-_)/g;
const SPOTIFY_SEARCH_LIMIT = 50;


function itemMatchesArtist(item, artistName) {
	return  (
		(!!artistName && item.artists.some(artist => artistName.includes(artist.name))) ||
		!artistName
	);
}

function getAlbumURL(albumName, artistName, market) {
	albumName = albumName.replace(REPLACE_ALBUM_NAME_REGEX, '').replace(REPLACE_DELIIMITER_CHARTS, ' ');
	return searchSpotify(
			'album',
			albumName,
			market
		)
		.then(
			response =>  response.albums.items.filter(item => (
									item.name.toLowerCase() == albumName.trim().toLowerCase() &&
									itemMatchesArtist(item, artistName)
								)
						)
						.map(item => item.external_urls.spotify)[0]
		);
}

function getArtistURL(artistName, market) {

	return searchSpotify(
			'artist',
			artistName,
			market
		)
		.then(response => response.artists.items.length ? response.artists.items[0].external_urls.spotify : null);

}

function getTrackURL(trackName, artistName, market) {

	return searchSpotify(
			'track',
			trackName,
			market
		)
		.then(
			response => response.tracks.items
						.filter(item => (
									item.name.toLowerCase() == trackName.trim().toLowerCase() &&
									itemMatchesArtist(item, artistName)
								)
						)
						.map(item => item.external_urls.spotify)[0]
		);
}

function searchiTunesFallback(query, fallbackResponse) {
	return new Promise((resolve, reject) => {
		searchitunes(query)
		.then(result => resolve(result))
		.catch(err => {
			console.error(`Search itunes for query ${query} failed with error ${err}`);
			resolve(fallbackResponse);
		});
	});
}

function searchSpotify(type, q, market) {

	let query = querystring.stringify({
		type,
		q,
		market,
		limit: SPOTIFY_SEARCH_LIMIT
	});

	return spotify.request(`${SPOTIFY_SEARCH_URI}?${query}`);
}

function processURL(linkURL) {

	const { path, query } = url.parse(linkURL, { parseQueryString: true });

	if(ALBUM_REGEX.test(path) && query.i) {

		const [ , market, trackName, albumId] = ALBUM_REGEX.exec(path);
		return searchiTunesFallback({id: query.i}, {
				trackName: trackName.replace(REPLACE_DELIIMITER_CHARTS, ' ')
			})
			.then(response => {
				const { trackName, artistName } = response;
				return getTrackURL(trackName, artistName, market);
			});

	} else if(ALBUM_REGEX.test(path)) {

		const [ , market, collectionName, albumId] = ALBUM_REGEX.exec(path);

		return searchiTunesFallback({id: albumId}, {
				collectionName: collectionName.replace(REPLACE_DELIIMITER_CHARTS, ' ')
			})
			.then(response => {
				const { collectionName, artistName } = response;
				return getAlbumURL(collectionName, artistName, market);
			});

	} else if(ARTIST_REGEX.test(path)) {

		let [ , market, artistName, artistId] = ARTIST_REGEX.exec(path);
		artistName = artistName.replace(REPLACE_DELIIMITER_CHARTS, ' ');

		return searchiTunesFallback({id: artistId}, { artistName })
			.then(response => getArtistURL(response.artistName, market));
	}

	return null;
}

module.exports = {
	searchitunes,
	searchSpotify,
	processURLs: (urls) => {
		return Promise
			.all(urls.map(processURL))
			.then(results => results.filter(result => !!result));
	}
};
