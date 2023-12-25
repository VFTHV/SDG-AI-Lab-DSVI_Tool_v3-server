const notFound = (req, res) => res.status(404).send('Route does not exist');
// not found error

module.exports = notFound;
