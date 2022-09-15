const express = require("express");
const db = require("./db/data");
const { ecsign, ecrecover } = require("ethereumjs-util");
const ethers = require("ethers");
const dotenv = require('dotenv')

process.env.TZ = 'Etc/Universal'

dotenv.config()

const router = express.Router();

const sanitizeTokens = (tokens) => tokens.replace(/\s/g, "").split(",");

const msghash = async (tokens, date) => {
  const { keccak256, solidityPack } = ethers.utils;
  const types = [], data = [];
  const prices = await Promise.all(
    tokens.map(
      token => db.queryPriceOnDate(token, date.toISOString())
    )
  );

  prices.forEach((price, i) => {
    types.push("string"); // token
    types.push("uint256"); // price
    types.push("uint256"); // date

    data.push(tokens[i]);
    data.push(Math.round(Number(price)));
    data.push(date.getTime());
  });

  return Buffer.from(keccak256(solidityPack(types, data)).slice(2), 'hex');
}

const processTimeSeries = (data, interval) => {
  const result = []
  let now = new Date()
  let i = data.length - 1;

  for (; ;) {
    while (new Date(data[i].date).getTime() > now.getTime()) {
      i--
      if (i < 0) {
        return result
      }
    }

    result.push({
      price: data[i].price,
      date: now.toISOString()
    })

    if (interval === 'min') {
      now = new Date(now.getTime() - 60 * 1000)
    } else if (interval === 'hour') {
      now = new Date(now.getTime() - 3600 * 1000)
    } else if (interval === 'week') {
      now = new Date(now.getTime() - 24 * 7 * 3600 * 1000)
    } else if (interval === 'month') {
      now.setMonth(now.getMonth() - 1)
    } else if (interval === 'year') {
      now.setFullYear(now.setFullYear() - 1)
    } else {
      now = new Date(now.getTime() - 24 * 3600 * 1000)
    }
  }

  return result
}

router.get("/tokens/:token", async (req, res) => {
  const data = await db.queryTokenPrices(req.params.token);
  const interval = req.query.every ?? 'day'
  res.json(processTimeSeries(data, interval));
});

router.get("/sign", async (req, res) => {
  if (!req.query.tokens) {
    res.status(400).send('missing query param: tokens')
    return
  } else if (!req.query.date) {
    res.status(400).send('missing query param: date')
    return
  }

  const msg = await msghash(
    sanitizeTokens(req.query.tokens),
    new Date(req.query.date)
  );

  const { v, r, s } = ecsign(
    msg,
    Buffer.from(process.env.PRIVATE_KEY, "hex")
  );

  res.json("0x" + r.toString("hex") + s.toString("hex") + v.toString(16));
});

router.get("/verify", async (req, res) => {
  if (!req.query.tokens) {
    res.status(400).send('missing query param: tokens')
    return
  } else if (!req.query.date) {
    res.status(400).send('missing query param: date')
    return
  } else if (!req.query.signature) {
    res.status(400).send('msising query param: signature')
    return
  }

  const msg = await msghash(
    sanitizeTokens(req.query.tokens),
    new Date(req.query.date)
  );

  const sign = req.query.signature.slice(2)
  const r = Buffer.from(sign.slice(0, 64), 'hex')
  const s = Buffer.from(sign.slice(64, 128), 'hex')
  const v = Buffer.from(sign.slice(128), 'hex')

  const publicKey = new ethers.utils.SigningKey('0x' + process.env.PRIVATE_KEY).publicKey.slice(4)
  const recovered = ecrecover(msg, v, r, s).toString("hex")

  res.json(recovered === publicKey)
});

module.exports = router;
