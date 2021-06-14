const express = require("express");
const app = express();
const addDays = require("./node_modules/date-fns/addDays/index");

app.get("/", (request, response) => {
  let date = addDays(new Date(), 100);
  response.send(
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  );
});

app.listen(3001);
module.exports = app;
