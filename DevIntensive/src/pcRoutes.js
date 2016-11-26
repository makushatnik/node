import express from 'express';

const router = express.Router();

router.get(/^([\w]+)\/?([\w]+)?\/?([\w]+)?$/, function(req, res) {
  console.log(req.params);
  if (!req.params.length) res.status(400).send("Not Found");
  result = pc;
  for (let i=0; i < req.params.length; i++) {
    const curParam = req.params[i];
    if (!pc.hasOwnProperty(curParam)) res.status(400).send("Not Found");
    result = pc[curParam];
  }
  res.status(200).send(result);
});

///^(?:\/)?(.*?)(?:\/)?$/