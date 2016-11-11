import express from 'express';
import cors from 'cors';

import canonize from './canonize';

const app = express();
app.use(cors());
app.get('/', (req, res) => {
  res.json({
    hello: 'JS World',
  });
});

app.get('/task2A', (req, res) => {
  const sum = (parseInt(req.query.a) || 0) + (parseInt(req.query.b) || 0);
  res.send(sum.toString());
});

app.get('/task2B', (req, res) => {
  let fullname = req.query.fullname.trim();
  console.log(fullname);
  if (!fullname) {
  	res.send('Invalid fullname');
  	return;
  }
  if (/[0-9_/]/g.test(fullname)) {
  	res.send('Invalid fullname');
  	return;
  }
  fullname = fullname.toLowerCase();
  let arr = fullname.split(/[\s]+/);
  let res_str = '';
  
  if (arr.length <= 0 || arr.length > 3) {
  	res.send('Invalid fullname');
  	return;
  } else if (arr.length === 3) {
  	res_str = arr[2].charAt(0).toUpperCase() + arr[2].substr(1) + ' '
        + arr[0].charAt(0).toUpperCase() + '. ' + arr[1].charAt(0).toUpperCase() + '.';
  } else if (arr.length === 2) {
  	res_str = arr[1].charAt(0).toUpperCase() + arr[1].substr(1) + ' '
        + arr[0].charAt(0).toUpperCase() + '.';
  } else if (arr.length === 1) {
  	res_str = arr[0].charAt(0).toUpperCase() + arr[0].substr(1);
  }
  res.send(res_str);
});

app.get('/task2C', (req, res) => {
  let username = req.query.username.trim();
  if (!username) res.send('Invalid username');
  username = canonize(username);
  if (!username) res.send('Invalid username');
  res.send('@' + username);
});

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});
