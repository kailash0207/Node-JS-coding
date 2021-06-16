const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");
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

// Register User API
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const checkUserQuery = `
    SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(checkUserQuery);
  if (dbUser != undefined) {
    response.status(400);
    response.send("User already exists");
  } else if (password.length < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    const hashPassword = await bcrypt.hash(password, 10);
    const createUserQuery = `
        INSERT INTO user
        (username, name, password, gender, location)
        VALUES
        ('${username}','${name}','${hashPassword}','${gender}','${location}');`;
    await db.run(createUserQuery);
    response.status(200);
    response.send("User created successfully");
  }
});

//Login User API
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkUserQuery = `
    SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(checkUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordCorrect = await bcrypt.compare(password, dbUser.password);
    if (isPasswordCorrect === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//Change Password API
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const findPasswordQuery = `
    SELECT password FROM user WHERE username = '${username}';`;
  const { password } = await db.get(findPasswordQuery);
  const isPasswordCorrect = await bcrypt.compare(oldPassword, password);
  if (isPasswordCorrect === false) {
    response.status(400);
    response.send("Invalid current password");
  } else if (newPassword.length < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    const updatePasswordQuery = `
    UPDATE user
    SET password = '${newHashPassword}'
    WHERE username = '${username}';`;
    await db.run(updatePasswordQuery);
    response.status(200);
    response.send("Password updated");
  }
});

module.exports = app;
