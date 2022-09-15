const express = require("express");
const routes = require("./routes.js");
const fetchPrice = require("./jobs");

const app = express();

// create a server object:
app.get("/", function (req, res) {
  res.write("Hello World!"); //write a response to the client
  res.end(); //end the response
});

app.use("/", routes);

fetchPrice();

app.listen(8080, function () {
  console.log("server running on 8080");
}); //the server object listens on port 8080
