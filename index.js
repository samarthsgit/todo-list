import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  port: 5432,
  password: process.env.password
});

db.connect();

// let items = [
//   { id: 1, title: "Buy milk" },
//   { id: 2, title: "Finish homework" },
// ];

async function getListItems() {
  try {
    const response = await db.query("SELECT * FROM items");
    return response.rows;
  } catch(err) {
    console.error("Error getting Items List from DB", err);
  }
}

app.get("/", async (req, res) => {
  const items = await getListItems();
  console.log(items);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  // items.push({ title: item });
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch(err) {
    console.error("Error adding new item in DB", err);
  }
});

app.post("/edit", async (req, res) => {
  const updateItemId = req.body.updatedItemId;
  const updateItemTitle = req.body.updatedItemTitle;
  try {
    await db.query("UPDATE items SET title=$1 WHERE id=$2", [updateItemTitle, updateItemId]);
    res.redirect("/");
  } catch(err) {
    console.error("Error updating title", err);
  }
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id=$1", [deleteItemId]);
    res.redirect("/");
  } catch(err) {
    console.error("Error deleting item from DB", err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
