const express = require("express");
const app = express();

app.get("/", (request, response) => {
  let date = new Date();
  let string_date = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;
  response.send(string_date);
});

app.listen(3001);
module.exports = app;
