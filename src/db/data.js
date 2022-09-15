const conn = require('./conn');

module.exports.insert = async (data) => {
  const values = data.map(
    item => [item.price, item.token, item.date]
      .map(val => '\'' + val  + '\'')
      .join(',')
  )
    .map(value => '(' + value + ')')
    .join(',')
  const query = `INSERT INTO \`prices\` (\`price\`, \`token\`, \`date\`) VALUES ${values}`
  conn.execute(query, [])
};

module.exports.queryTokenPrices = async (token) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT price, date FROM prices WHERE token = ? ORDER BY date`,
      [token],
      (err, results) => results ? resolve(results) : reject(err)
    )
  })
};

module.exports.queryPriceOnDate = async (token, date) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT token, price, date FROM prices WHERE token = ? AND date >= ? AND date <= DATE_ADD(?, INTERVAL 1 DAY) LIMIT 1`,
      [token, date, date],
      (err, results) => {
        if (err) {
          reject(err)
        } else if (results.length > 0) {
          resolve(results[0].price)
        } else {
          resolve(null)
        }
      }
    )
  })
};
