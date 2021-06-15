const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
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
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT player_id AS playerId, player_name AS playerName
    FROM player_details;`;
  const players = await db.all(getPlayersQuery);

  response.send(players);
});

//Get Player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT player_id AS playerId, player_name AS playerName
    FROM player_details WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);

  response.send(player);
});

//Update Player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
   UPDATE player_details
   SET
   player_name = '${playerName}'
   WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);

  response.send("Player Details Updated");
});

//Get Match Details API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT match_id AS matchId, match, year
    FROM match_details WHERE match_id = ${matchId};`;
  const matchDetails = await db.get(getMatchDetailsQuery);

  response.send(matchDetails);
});

//Get Matches of Player API
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT match_id AS matchId, match, year
    FROM player_match_score natural join match_details WHERE player_id = ${playerId};`;
  const playerMatches = await db.all(getPlayerMatchesQuery);

  response.send(playerMatches);
});

//Get Players of Match API
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
     SELECT player_id AS playerId, player_name AS playerName
     FROM player_details natural join player_match_score WHERE match_id = ${matchId};`;
  const matchPlayers = await db.all(getMatchPlayersQuery);

  response.send(matchPlayers);
});

//Get Player Statistics API
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerStatsQuery = `
    SELECT player_id AS playerId, player_name AS playerName, SUM(score) as totalScore,
    SUM(fours) AS totalFours, SUM(sixes) AS totalSixes
    FROM player_match_score natural join player_details WHERE player_id = ${playerId};`;
  const playerStats = await db.get(getPlayerStatsQuery);

  response.send(playerStats);
});

module.exports = app;
