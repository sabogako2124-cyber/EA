
"use strict";

const Database = require("better-sqlite3");
const path = require("path");

// Create or open the SQLite database.
const db = new Database(
    path.join(__dirname, "cafe-portal.db")
);

// Improve database reliability.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ========================================
// CREATE TABLES
// ========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_type TEXT NOT NULL
            CHECK (account_type IN ('student', 'faculty', 'staff')),
        identifier TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        category TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >= 0),
        image TEXT DEFAULT '',
        available INTEGER NOT NULL DEFAULT 1
            CHECK (available IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL CHECK (total >= 0),
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price REAL NOT NULL CHECK (price >= 0),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
`);

// ========================================
// INSERT SAMPLE PRODUCTS
// Only runs when the products table is empty.
// ========================================

const productCount = db
    .prepare("SELECT COUNT(*) AS total FROM products")
    .get().total;

if (productCount === 0) {
    const insertProduct = db.prepare(`
        INSERT INTO products
            (name, description, category, price)
        VALUES
            (@name, @description, @category, @price)
    `);

    const sampleProducts = [
        {
            name: "Cafe Americano",
            description: "Classic coffee with a rich aroma.",
            category: "Coffee",
            price: 85
        },
        {
            name: "Cafe Latte",
            description: "Espresso mixed with steamed milk.",
            category: "Coffee",
            price: 110
        },
        {
            name: "Caramel Macchiato",
            description: "Coffee with milk and caramel flavor.",
            category: "Coffee",
            price: 125
        },
        {
            name: "Chocolate Milk",
            description: "A sweet and creamy chocolate drink.",
            category: "Non-Coffee",
            price: 90
        },
        {
            name: "Iced Matcha",
            description: "Refreshing matcha green tea drink.",
            category: "Non-Coffee",
            price: 115
        },
        {
            name: "French Fries",
            description: "Crispy and freshly prepared fries.",
            category: "Snacks",
            price: 65
        },
        {
            name: "Ham and Cheese Sandwich",
            description: "A simple sandwich for a quick snack.",
            category: "Snacks",
            price: 75
        },
        {
            name: "Chicken Rice Meal",
            description: "A filling meal with chicken and rice.",
            category: "Meals",
            price: 135
        }
    ];

    const insertMany = db.transaction(items => {
        for (const item of items) {
            insertProduct.run(item);
        }
    });

    insertMany(sampleProducts);
}

console.log("Cafe Portal database is ready.");

module.exports = db;
