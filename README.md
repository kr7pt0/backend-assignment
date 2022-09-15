- MySql is used for database

- Set env variables

- Create table
npm run migrate

- Used Chainlink oracle

- Chainlink oracle updates Ether price every 1 - 30 mins, while Matic and BNB are relatively slower than Ether update

- Price series endpoint
i.e. http://localhost:8080/tokens/ether?every=min

- Get signature
Signature is created via ecsign
i.e. http://localhost:8080/sign?tokens=bnb,matic&date=2022-09-15

- Verify signature
Signature is verified via ecrecover
i.e. http://localhost:8080/verify?tokens=bnb,matic&date=2022-09-15&signature=[data from above endpoint including leading 0x]
