const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");

app.use(express.json());
let db = null;

const initialDBAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};

initialDBAndServer();
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const haspriorityPrperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hascategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hassearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const checkValid = (request, response, next) => {
  const { status, priority, category, date } = request.query;
  statusContainer = ["TO DO", "IN PROGRESS", "DONE"];
  priorityContainer = ["HIGH", "MEDIUM", "LOW"];
  categoryContainer = ["WORK", "HOME", "LEARNING"];
  console.log(priorityContainer.includes(priority));
  if (status !== undefined) {
    if (statusContainer.includes(status)) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (priority !== undefined) {
    if (priorityContainer.includes(priority)) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (category !== undefined) {
    if (categoryContainer.includes(category)) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date);
      const formatedDate = format(new Date(date), "yyyy-MM-dd");
      console.log(formatedDate, "f");
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`
        )
      );
      console.log("result ", result);
      // console.log(new Date(), "new");
      const isValidDate = isValid(result);
      if (isValidDate === true) {
        request.date = formatedDate;
        //   console.log(formatedDate, "for");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  //   if(search)
  next();
};
const updateValid = (request, response, next) => {
  const { status, priority, category, dueDate } = request.body;
  statusContainer = ["TO DO", "IN PROGRESS", "DONE"];
  priorityContainer = ["HIGH", "MEDIUM", "LOW"];
  categoryContainer = ["WORK", "HOME", "LEARNING"];
  //   console.log(priorityContainer.includes(priority));
  if (status !== undefined) {
    if (statusContainer.includes(status)) {
      console.log(true);
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  if (priority !== undefined) {
    if (priorityContainer.includes(priority)) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (category !== undefined) {
    if (categoryContainer.includes(category)) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate);
      console.log(myDate, "my");
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");

      const result = toDate(new Date(formatedDate));
      const isValidDate = isValid(result);
      if (isValidDate === true) {
        console.log(formatedDate, "formated");
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  next();
};
app.get("/todos/", checkValid, async (request, response) => {
  let getQuery = null;
  let dbResponse = null;
  const {
    search_q = "",
    todo,
    priority,
    status,
    category,
    dueDate,
  } = request.query;
  console.log(search_q);
  switch (true) {
    case hasStatusProperty(request.query):
      //   console.log(status);
      getQuery = `SELECT  id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE status = '${status}';`;
      dbResponse = await db.all(getQuery);
      response.send(dbResponse);
      break;

    case haspriorityPrperty(request.query):
      getQuery = `SELECT  id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE priority = '${priority}';`;
      dbResponse = await db.all(getQuery);
      response.send(dbResponse);
      break;

    case hascategoryProperty(request.query):
      getQuery = `SELECT  id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE category = '${category}';`;
      dbResponse = await db.all(getQuery);
      response.send(dbResponse);
      break;

    case hassearchProperty(request.query):
      getQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE todo LIKE '${search_q}%';`;
      dbResponse = await db.all(getQuery);
      response.send(dbResponse);
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE id ='${todoId}';`;
  const dbResponse = await db.get(getQuery);
  response.send(dbResponse);
});

app.get("/agenda/", checkValid, async (request, response) => {
  const { date } = request.query;
  //   const getQuery = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE due_date = '${date}';`;

  const getQuery = `SELECT * FROM todo WHERE due_date = '${date}';`;
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});
app.post("/todos/", updateValid, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  //   console.log(id, todo, priority, status, category, dueDate);
  const insertQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date)
                    VALUES( 
                        '${id}', 
                        '${todo}', 
                        '${priority}', 
                   '${status}',
                    '${category}',
                    '${dueDate}'
                    )`;

  const dbResponse = await db.run(insertQuery);
  response.send("Todo Successfully Added");
});

const hasStatusUpdate = (requestBody) => {
  return requestBody.status !== undefined;
};
const haspriorityUpdate = (requestBody) => {
  return requestBody.priority !== undefined;
};
const hasTodoUpdate = (requestBody) => {
  return requestBody.todo !== undefined;
};
const hasCategoryUpdate = (requestBody) => {
  return requestBody.category !== undefined;
};
const hasDateUpdate = (requestBody) => {
  return requestBody.dueDate !== undefined;
};

app.put("/todos/:todoId/", updateValid, async (request, response) => {
  const { status, priority, todo, category, dueDate } = request.body;
  const { todoId } = request.params;
  let getQuery = null;
  let dbResponse = null;
  switch (true) {
    case hasStatusUpdate(request.body):
      getQuery = `UPDATE todo SET status = '${status}' WHERE id = '${todoId}';`;
      //   console.log(getQuery);
      await db.run(getQuery);
      response.send("Status Updated");
      break;
    case haspriorityUpdate(request.body):
      getQuery = `UPDATE todo SET priority = '${priority}' WHERE id = '${todoId}';`;
      await db.run(getQuery);
      response.send("Priority Updated");
      break;
    case hasTodoUpdate(request.body):
      getQuery = `UPDATE todo SET todo = '${todo}' WHERE id = '${todoId}';`;
      await db.run(getQuery);
      response.send("Todo Updated");
      break;
    case hasCategoryUpdate(request.body):
      getQuery = `UPDATE todo SET category = '${category}' WHERE id = '${todoId}';`;
      await db.run(getQuery);
      response.send("Category Updated");
      break;
    case hasDateUpdate(request.body):
      console.log("in dateupdate");
      getQuery = `UPDATE  todo 
        SET due_date = '${dueDate}' 
        WHERE id = '${todoId}';`;
      await db.run(getQuery);
      response.send("Due Date Updated");
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `DELETE FROM todo WHERE id = '${todoId}';`;
  await db.run(getQuery);
  response.send("Todo Deleted");
});
module.exports = app;
