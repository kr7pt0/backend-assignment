const ethers = require("ethers");
const abi = require("@chainlink/contracts/abi/v0.8/AggregatorV3Interface");
const db = require("./db/data");

const oracles = [
  { addr: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", token: "ether" },
  { addr: "0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676", token: "matic" },
  { addr: "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A", token: "bnb" }
];

const lastRoundIds = [0, 0, 0]

const provider = ethers.getDefaultProvider();

const contracts = oracles.map(
  (oracle) => new ethers.Contract(oracle.addr, abi, provider)
);

const fetchPrices = async () => {
  const prices = await Promise.all(
    contracts.map((contract) =>
      Promise.all([contract.latestRoundData(), contract.decimals()])
    )
  );

  const data = prices.map((result, i) => {
    const [price, decimals] = result;
    const date = new Date(price.updatedAt * 1000).toISOString()

    return {
      date: date.slice(0, 10) + ' ' + date.slice(11, 19),
      price: price.answer.toNumber() / 10 ** decimals,
      token: oracles[i].token,
      round: price.answeredInRound.toString()
    };
  }).filter((result, i) => lastRoundIds[i] !== result.round);

  if (data.length > 0) {
    db.insert(data);
  }

  prices.forEach((result, i) => lastRoundIds[i] = result[0].answeredInRound.toString())
};

module.exports = () => {
  fetchPrices();
  setInterval(fetchPrices, 10_000);
};
