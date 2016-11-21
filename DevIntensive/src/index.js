import express from 'express';
import fetch from 'isomorphic-fetch';
import cors from 'cors';
import Promise from 'bluebird';
import _ from 'lodash';
import bunyan from 'bunyan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
//import cookieParser from 'cookie-parser';
//import expressJwt from 'express-jwt';
//import jwt from 'jsonwebtoken';

import canonize from './canonize';
import savePetsInDb from './savePetsInDb';
import Pet from './models/Pet';
import User from './models/User';
import isAdmin from './middlewares/isAdmin';
// import getApi from './api';
// import getAuth from './resources/Auth';
// import getMiddlewares from './middlewares';

global.__DEV__ = true;

const log = bunyan.createLogger({
  name: 'app',
  src: __DEV__,
  level: 'trace'
});

// const middlewares = getMiddlewares({
//   log,
// });

// const models = {
//   User,
// }

// const auth = getAuth({
//   log,
//   models
// });

mongoose.Promise = Promise;
//mongoose.connect('mongodb://localhost/skillbranch');

const app = express();

// app.use(middlewares.reqLog);
// app.use(middlewares.accessLogger);
// app.use(middlewares.reqParser);

// app.use(auth.parseToken);
// app.use(auth.parseUser);


//const router = express.Router();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(cookieParser());

//***************************  MONGO SECTION  *****************************
app.get('/users', async (req, res) => {
  const users = await User.find();
  return res.json(users);
});

app.get('/pets', async (req, res) => {
  const pets = await Pet.find().populate('owner');
  return res.json(pets);
});

app.get('/clear', isAdmin, async (req, res) => {
  await User.remove();
  await Pet.remove();
  return res.send('OK');
});

app.post('/data', async (req, res) => {
  const data = req.body;
  if (!data.user) return res.status(400).send('User required');
  if (!data.pets) data.pets = [];
  
  const user = await User.findOne({name: data.user.name});
  if (user) res.status(400).send('User w same name is already exists');
  
  try {
    const result = await savePetsInDb(data);
    return res.json(result);
  } catch(err) {
    return res.status(500).json(err);
  }
});
//***************************  END SECTION  ****************************

// const secret = "shhhhhhared-secret";

// app.get('/', (req, res) => {
//   res.json({
//     hello: 'JS World',
//   });
// });

// app.get('/token', (req, res) => {
//   const data = {
//     user: "eageev",
//     name: "Evgeny Ageev"
//   };
//   return res.json(jwt.sign(data, secret));
// });

// app.get('/protected', expressJwt(secret), (req, res) => {
//   return res.json(req.user);
// });

// const auth = getAuth({
//   models: {User}
// });

// app.all('/auth/validate', auth.validate);
// app.post('/auth/signup', auth.signup);
// app.all('/auth/login', auth.login);

// const api = getApi({});
// app.use('/api', api);

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

//************************** COLORS SECTION *****************************
app.get('/task2D', (req, res) => {
  let param;
  let parsed;
  if (req.query.color !== undefined) {
    param = req.query.color;
    param = param.toLowerCase().replace(/\s/g,"");
    param = param.replace(/%20/g,'');
  } else {
    return res.status(400).send('Invalid color');
  }
  let tmp = '';
  console.log('param - ' + param);
  //check Hex number
  if (/^#?[\da-f]{3,6}$/.test(param)) {
    if (param.indexOf('#') !== -1) {
      param = param.substring(1);
    }

    if (param.length === 3) {
      param = param.split('').map(x => x + x).join('');
    } else if (param.length !== 6) {
      return res.send('Invalid color');
    }
  //check RGB
  } else {
    let aRGB = param.match(/^rgb\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);
    //let HSL = param.match(/^hsl\((\d{1,3}[%]?),(\d{1,3}[%]?),(\d{1,3}[%]?)\)$/i);
    let HSL = param.match(/^hsl\((\d{1,3}),(\d{1,3}%),(\d{1,3}%)\)$/i);
    if (aRGB) {
      for (var i=1;  i<=3; i++) {
        console.log(aRGB[i]);
        let num = parseInt(aRGB[i]);
        console.log(num);
        if (num > 255) return res.send('Invalid color');
        tmp += Math.round((aRGB[i][aRGB[i].length-1]=="%"?2.55:1)*num).toString(16).replace(/^(.)$/,'0$1');
      }
      param = tmp;
    //check HSL
    } else if (HSL) {
      let arr_num = [];
      for (var i=1;  i<=3; i++) {
        let num = parseInt(HSL[i]);
        arr_num[i-1] = num;
      }

      let obj = hsl2rgb(arr_num[0],arr_num[1],arr_num[2]);
      if (!obj) return res.send('Invalid color');

      tmp = rgb2hex(obj.r, obj.g, obj.b);
      if (!tmp) return res.send('Invalid color');
      param = tmp;
    } else {
      return res.send('Invalid color');
    }
  }
  
  return res.send('#' + param);
});

function rgb2hex(r, g, b) {
  let str = '';
  let r_num = parseInt(r);
  let g_num = parseInt(g);
  let b_num = parseInt(b);
  if (r_num < 0 || r_num > 255 || g_num < 0 || g_num > 255 || b_num < 0 || b_num > 255) return false;

  str = r_num.toString(16).replace(/^(.)$/,'0$1') +
        g_num.toString(16).replace(/^(.)$/,'0$1') +
        b_num.toString(16).replace(/^(.)$/,'0$1');
  return str;
}

function hsl2rgb(h, s, l) {
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return false;

  var m1, m2, hue;
  var r, g, b;
  s /= 100;
  l /= 100;
  if (s === 0)
    r = g = b = (l * 255);
  else {
    if (l < 0.5)
      m2 = l * (s + 1);
    else
      m2 = l + s - l * s;
    m1 = l * 2 - m2;
    hue = h / 360;
    r = HueToRgb(m1, m2, hue + 1/3);
    g = HueToRgb(m1, m2, hue);
    b = HueToRgb(m1, m2, hue - 1/3);
  }

  return {r: r, g: g, b: b};
}

function HueToRgb(m1, m2, hue) {
  var v;
  if (hue < 0)
    hue += 1;
  else if (hue > 1)
    hue -= 1;

  if (6 * hue < 1)
    v = m1 + (m2 - m1) * hue * 6;
  else if (2 * hue < 1)
    v = m2;
  else if (3 * hue < 2)
    v = m1 + (m2 - m1) * (2/3 - hue) * 6;
  else
    v = m1;

  return Math.round(255 * v);
}
//*********************** END SECTION ********************************

//***********************  POKEMONS API SECTION  *********************
const pokeapiUrl = 'https://pokeapi.co/api/v2/';
const pokemonFields = ['id','name','base_experience','height','is_default','order','weight'];
async function getPokemons(url, i = 0) {
  console.log('getPokemons ', url, i);
  const response = await fetch(url);
  const page = await response.json();
  const pokemons = page.results;
  if (__DEV__ && i > 3) {
    return pokemons;
  }
  if (page.next) {
    const pokemons2 = await getPokemons(page.next, i + 1);
    return [
      ...pokemons,
      ...pokemons2
    ];
  }
  return pokemons;
}

async function getPokemon(url) {
  console.log('getPokemon ', url);
  const response = await fetch(url);
  const pokemon = await response.json();
  return pokemon;
}
app.get('/task3X', async (req, res) => {
  try {
    const pokemonsInfo = await getPokemons(pokeapiUrl + 'pokemon/');
    const pokemonsPromises = pokemonsInfo.map(info => {
      return getPokemon(info.url);
    });
    const pokemonsFull = await Promise.all(pokemonsPromises);
    const pokemons = pokemonsFull.map(pokemon => {
      return _.pick(pokemon, pokemonFields);
    });
    const sortPokemons = _.sortBy(pokemons, pokemon => pokemon.weight).reverse();
    return res.json({sortPokemons});
  } catch (err) {
    console.log(err);
    return res.json({err});
  }
});
//*************************  END SECTION  *************************

//es6 test
app.get('/es6', (req, res) => {
  let name = 'John';
  let tmp = `Hello, ${name}`;
  console.log(tmp);
  res.send(tmp);
});

//**************************  PC SECTION  *************************
let pc = {};
const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';
app.get('/loadPC', async (req, res) => {
  try {
    const response = await fetch(pcUrl);
    pc = await response.json();
  } catch(err) {
    console.log('Что-то пошло не так:', err);
  }
  //console.log(pc);
  res.json(pc);
});

app.get('/task3A', (req, res) => {
  res.status(200).json(pc);
});

app.get(/^\/task3A\/([\w.\-\[\]]+)\/?([\w.\-\[\]]+)?\/?([\w.\-\[\]]+)?$/, (req, res) => {
  console.log(req.params);
  if (!Object.keys(req.params).length) return res.status(400).send("Empty parameters");

  // /volumes
  if (req.params[0] === 'volumes') {
    let tmp = [];
    let hddArr = pc.hdd;
    for (let i=0; i < hddArr.length; i++) {
      let curEl = hddArr[i];
      let drive = curEl.volume;

      let dr_found = false;
      for (let j=0; j < tmp.length; j++) {
        if (tmp[j].volume === drive) {
          tmp[j].size += curEl.size;
          dr_found = true;
          break;
        }
      }
      if (!dr_found) {
        tmp.push({
          volume: drive,
          size: curEl.size
        });
      }
    }
    let resObj = {};
    for (let i=0; i < tmp.length; i++) {
      resObj[tmp[i].volume] = tmp[i].size + 'B';
    }
    return res.status(200).json(resObj);
  }

  let result = pc;
  let is_arr = false;
  for (let key in req.params) {
    let curParam = req.params[key];
    if (!curParam) break;

    if (!is_arr) {
      if (!result.hasOwnProperty(curParam) ||
          typeof result === 'string' || typeof result === 'number') {// ending value has no attrs
        return res.status(404).send("Not Found");
      }
    } else if (/^[\d]+$/.test(curParam)) {//HDD
      const num = +curParam;
      if (num < 0 || num > result.length) return res.status(404).send("Not Found");
      result = result[num];
      is_arr = false;
      continue;
    } else {//HDD w Invalid Parameter
      return res.status(404).send("Not Found");
    }

    if (_.isArray(result[curParam])) {
      is_arr = true;
      result = result[curParam];
    } else {
      if (!is_arr) {
        result = result[curParam];
      } else {
        let tmp = [];
        for (let i=0; i < result.length; i++) {
          let curEl = result[i];
          if (_.isObject(curEl)) {
            for (let prop in curEl) {
              if (prop === curParam) {
                tmp[i] = {
                  curParam: curEl[prop]
                };
              }
            }
          }
        }
        result = tmp;
        break;
      }
    }
  }
  res.status(200).json(result);
});
//*****************  END SECTION ******************


app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});
