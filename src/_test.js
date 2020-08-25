const { TEST_ACCESS_TOKEN } = process.env;
const { processURLs } = require('../_process-urls');

module.exports = (req, res) => {

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
};