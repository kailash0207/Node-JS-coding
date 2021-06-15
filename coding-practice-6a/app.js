const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is starting at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateObjToResponseObj = (inputObj) => {
  return {
    stateId: inputObj.state_id,
    stateName: inputObj.state_name,
    population: inputObj.population,
  };
};
const convertDistrictObjToResponseObj = (inputObj) => {
  return {
    districtId: inputObj.district_id,
    districtName: inputObj.district_name,
    stateId: inputObj.state_id,
    cases: inputObj.cases,
    cured: inputObj.cured,
    active: inputObj.active,
    deaths: inputObj.deaths,
  };
};
//Get States API
app.get("/states/", async (request, response) => {
  const getStatesQuery = `SELECT * FROM state`;
  const states = await db.all(getStatesQuery);
  response.send(states.map((element) => convertStateObjToResponseObj(element)));
});

//Get State API
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT * FROM state WHERE state_id = ${stateId}`;
  const state = await db.get(getStateQuery);
  response.send(convertStateObjToResponseObj(state));
});

//Add District API
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `INSERT INTO district 
    (district_name, state_id, cases, cured, active, deaths)
    VALUES
    ('${districtName}',${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//Get District API
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId}`;
  const district = await db.get(getDistrictQuery);
  response.send(convertDistrictObjToResponseObj(district));
});

//Delete District API
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ${districtId}`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//Update District API
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
  UPDATE district
  SET
  district_name = '${districtName}',
  state_id = ${stateId},
  cases = ${cases},
  cured = ${cured},
  active = ${active},
  deaths = ${deaths}
  WHERE district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//Get Statistics of State API
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT 
    SUM(cases) as totalCases,
    SUM(cured) as totalCured,
    SUM(active) as totalActive,
    SUM(deaths) as totalDeaths
    FROM district WHERE state_id = ${stateId};`;
  const stats = await db.get(getStateStatsQuery);

  response.send(stats);
});

//Get StateName of District API
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
  SELECT state_name as stateName FROM 
  district natural join state WHERE district_id = ${districtId};`;
  const state = await db.get(getStateNameQuery);
  response.send(state);
});

module.exports = app;
