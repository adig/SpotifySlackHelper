const metascraper = require('metascraper')([
	require('metascraper-description')(),
	require('metascraper-image')(),
	require('metascraper-title')(),
	require('metascraper-url')(),
	require('metascraper-logo-favicon')(),
	require('metascraper-publisher')()
]);

const got = require('got');

module.exports = (urls) => {

	return Promise.all(
		urls.map(url => got(url)
			.then(response => {
				return metascraper({
					html: response.body,
					url: response.url
				});
			})
			.then(metadata => {
				return ({
				author_name: metadata.publisher,
				author_icon: metadata.logo,
				title: metadata.title,
				title_link: metadata.url,
				text: metadata.description,
				thumb_url: metadata.image
				})
			})
		)
	);
};
