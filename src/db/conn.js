const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  timezone: '+00:00'
})

module.exports = conn
