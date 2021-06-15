const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
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

//Todo Filter API
app.get("/todos/", async (request, response) => {
  let { status = "", priority = "", search_q = "" } = request.query;
  status = status.replace("%20", " ");
  search_q = search_q.replace("%20", " ");
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE todo LIKE '%${search_q}%' AND
    priority LIKE '%${priority}%' AND
    status LIKE '%${status}%';`;
  const todoList = await db.all(getTodoQuery);
  response.send(todoList);
});

//Get Todo with Todo ID API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//Create Todo API
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const creteTodoQuery = `
    INSERT INTO todo
    (id, todo, priority, status)
    VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(creteTodoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  if (status != undefined) {
    const updateQuery = `
        UPDATE todo
        SET status = '${status}'
        WHERE id = ${todoId};`;
    await db.run(updateQuery);
    response.send("Status Updated");
  } else if (priority != undefined) {
    const updateQuery = `
        UPDATE todo
        SET priority = '${priority}'
        WHERE id = ${todoId};`;
    await db.run(updateQuery);
    response.send("Priority Updated");
  } else {
    const updateQuery = `
        UPDATE todo
        SET todo = '${todo}'
        WHERE id = ${todoId};`;
    await db.run(updateQuery);
    response.send("Todo Updated");
  }
});

// Delete Todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
