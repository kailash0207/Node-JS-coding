const addDays = require("date-fns/addDays");
const fun = (days) => {
  let date = addDays(new Date("08/22/2020"), days);
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};
module.exports = fun;
