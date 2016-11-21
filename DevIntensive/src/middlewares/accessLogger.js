import leftPad from 'left-pad';

function levelFn(data) {
	if (data.err || data.status >= 500 || data.duration > 10000) return 'error';
	else if (data.status >= 400 || data.duration >= 3000) return 'warn';
	return 'info';
}

function logStart(data) {
	return `${leftPad(data.method, 4)} ${data.url} started reqId=${data.reqId}`;
}

function logFinish(data) {
	const time = (data.duration || 0).toFixed(3);
	const length = (data.length || 0);
	return `${leftPad(data.method, 4)} ${data.url} ${leftPad(data.status, 3)} ${leftPad(time, 7)}ms ${leftPad(length, 5)}b reqId=${data.reqId}`;
}

export default (params) => ([
	(req, res, next) => {
		const data = {};
		if (!req.log) throw 'has no req.log';
		const log = req.log.child({
			component: 'req'
		});

		data.reqId = req.reqId;
		data.method = req.method;
		if (true) {}
	}
]);