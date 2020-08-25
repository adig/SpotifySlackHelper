const { TEST_ACCESS_TOKEN } = process.env;
const { searchSpotify } = require('../_process-urls');

module.exports = (req, res) => {

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
}