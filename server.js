
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database(path.join(__dirname, "cafe-portal.db"));

app.use(express.json());
app.use(express.static(__dirname));


const productCount = db.prepare(
  "SELECT COUNT(*) AS count FROM products"
).get();

if (productCount.count === 0) {
  const addProduct = db.prepare(
    "INSERT INTO products (name, price) VALUES (?, ?)"
  );

  addProduct.run("Iced Coffee", 89);
  addProduct.run("Spanish Latte", 110);
  addProduct.run("Chocolate Cake", 95);
  addProduct.run("French Fries", 65);
  addProduct.run("Chicken Sandwich", 120);
}


db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )
`);



app.get("/api/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, price } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return res.status(400).json({ error: "Invalid product details" });
  }

  const result = db.prepare(
    "INSERT INTO products (name, price) VALUES (?, ?)"
  ).run(name.trim(), price);

  res.status(201).json({
    id: Number(result.lastInsertRowid),
    name: name.trim(),
    price
  });
});

app.post("/api/products", (req, res) => {
  const { name, price } = req.body;

  const result = db.prepare(
    "INSERT INTO products (name, price) VALUES (?, ?)"
  ).run(name, price);

  res.json({
    message: "Product added successfully!",
    id: result.lastInsertRowid
  });
});

app.listen(3000, () => {
  console.log("Cafe Portal running at http://localhost:3000");
});
