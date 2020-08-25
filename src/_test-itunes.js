const { TEST_ACCESS_TOKEN } = process.env;
const { searchitunes } = require('../_process-urls');

module.exports = (req, res) => {

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
	});

};