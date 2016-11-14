export default (req, res, next) => {
	if (req.headers,users === 'admin') {
		return next();
	}
	return next('access error');
}