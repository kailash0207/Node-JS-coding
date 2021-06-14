const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const formatResponse = (inputObj) => {
  return {
    playerId: inputObj.player_id,
    playerName: inputObj.player_name,
    jerseyNumber: inputObj.jersey_number,
    role: inputObj.role,
  };
};

//Get Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team player_id`;
  const players = await db.all(getPlayersQuery);
  const formattedResponse = players.map((player) => formatResponse(player));
  response.send(formattedResponse);
});

//Add Player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team
    (player_name,jersey_number,role)
    VALUES
    ('${playerName}',${jerseyNumber},'${role}')
  `;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Get Player Details API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const playerDetails = await db.get(getPlayerDetailsQuery);
  const formattedResponse = formatResponse(playerDetails);
  response.send(formattedResponse);
});

//Update Player Details API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Remove Player API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const removePlayerQuery = `
        DELETE FROM cricket_team
        WHERE
        player_id = ${playerId};`;
  await db.run(removePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
