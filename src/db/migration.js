const conn = require('./conn')

conn.execute(
  `CREATE TABLE \`prices\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`price\` decimal(10, 2) NULL,
    \`date\` datetime NULL,
    \`token\` enum('ether','matic','bnb') NULL,
    PRIMARY KEY (\`id\`)
  )`,
  [],
  (err, results) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Migration completed')
    }
    process.exit()
  }
)

