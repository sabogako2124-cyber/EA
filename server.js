
"use strict";

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


app.post("/api/register", (req, res) => {
    try {
        const { accountType, identifier, password } = req.body;

        const allowedTypes = ["student", "faculty", "staff"];

        if (
            !allowedTypes.includes(accountType) ||
            typeof identifier !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid account information."
            });
        }

        const cleanIdentifier = identifier.trim();

        if (
            cleanIdentifier.length < 3 ||
            cleanIdentifier.length > 100 ||
            password.length < 8 ||
            password.length > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Use an identifier of 3–100 characters and a password of 8–72 characters."
            });
        }

        const existingUser = db.prepare(`
            SELECT id FROM users WHERE identifier = ?
        `).get(cleanIdentifier);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "That account identifier is already registered."
            });
        }

        const passwordHash = bcrypt.hashSync(password, 12);

        const result = db.prepare(`
            INSERT INTO users
                (account_type, identifier, password_hash)
            VALUES (?, ?, ?)
        `).run(accountType, cleanIdentifier, passwordHash);

        return res.status(201).json({
            success: true,
            message: "Account registered successfully.",
            user: {
                id: Number(result.lastInsertRowid),
                accountType,
                identifier: cleanIdentifier
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to register the account."
        });
    }
});


app.post("/api/login", (req, res) => {
    try {
        const { accountType, identifier, password } = req.body;

        if (
            typeof accountType !== "string" ||
            typeof identifier !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter your account type, identifier, and password."
            });
        }

        const user = db.prepare(`
            SELECT id, account_type, identifier, password_hash
            FROM users
            WHERE identifier = ? COLLATE NOCASE
              AND account_type = ?
        `).get(identifier.trim(), accountType);

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({
                success: false,
                message: "Invalid account type, identifier, or password."
            });
        }

        return res.json({
            success: true,
            message: "Login successful.",
            user: {
                id: user.id,
                accountType: user.account_type,
                identifier: user.identifier
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log in. Please try again."
        });
    }
});


app.get("/api/products", (req, res) => {
    try {
        const products = db.prepare(`
            SELECT id, name, description, category, price, image
            FROM products
            WHERE available = 1
            ORDER BY category, name
        `).all();

        return res.json(products);

    } catch (error) {
        console.error("Products error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve products."
        });
    }
});

// ========================================
// PLACE ORDER
// Prices are read from the database, not the browser.
// ========================================

app.post("/api/orders", (req, res) => {
    try {
        const { userId, items } = req.body;

        if (
            !Number.isSafeInteger(Number(userId)) ||
            Number(userId) <= 0 ||
            !Array.isArray(items) ||
            items.length === 0 ||
            items.length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order information."
            });
        }

        const user = db.prepare(`
            SELECT id FROM users WHERE id = ?
        `).get(Number(userId));

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Please log in with a valid account."
            });
        }

        const combinedItems = new Map();

        for (const item of items) {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity);

            if (
                !Number.isSafeInteger(productId) ||
                productId <= 0 ||
                !Number.isSafeInteger(quantity) ||
                quantity <= 0 ||
                quantity > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product or quantity."
                });
            }

            combinedItems.set(
                productId,
                (combinedItems.get(productId) || 0) + quantity
            );
        }

        for (const quantity of combinedItems.values()) {
            if (quantity > 100) {
                return res.status(400).json({
                    success: false,
                    message: "The quantity for an item is too large."
                });
            }
        }

        const getProduct = db.prepare(`
            SELECT id, name, price
            FROM products
            WHERE id = ? AND available = 1
        `);

        const createOrder = db.prepare(`
            INSERT INTO orders (user_id, total, status)
            VALUES (?, ?, 'Pending')
        `);

        const addOrderItem = db.prepare(`
            INSERT INTO order_items
                (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `);

        const placeOrder = db.transaction(() => {
            const checkedItems = [];
            let total = 0;

            for (const [productId, quantity] of combinedItems) {
                const product = getProduct.get(productId);

                if (!product) {
                    throw new Error(
                        `Product ${productId} is unavailable.`
                    );
                }

                checkedItems.push({
                    productId,
                    quantity,
                    price: product.price
                });

                total += product.price * quantity;
            }

            total = Math.round((total + Number.EPSILON) * 100) / 100;

            const orderResult = createOrder.run(Number(userId), total);
            const orderId = Number(orderResult.lastInsertRowid);

            for (const item of checkedItems) {
                addOrderItem.run(
                    orderId,
                    item.productId,
                    item.quantity,
                    item.price
                );
            }

            return { orderId, total };
        });

        const order = placeOrder();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            orderId: order.orderId,
            total: order.total
        });

    } catch (error) {
        console.error("Place order error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to place order."
        });
    }
});


app.get("/api/orders", (req, res) => {
    try {
        const userId = Number(req.query.userId);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid user ID is required."
            });
        }

        const orders = db.prepare(`
            SELECT id, total, status, created_at AS createdAt
            FROM orders
            WHERE user_id = ?
            ORDER BY id DESC
        `).all(userId);

        return res.json(orders);

    } catch (error) {
        console.error("Order history error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve order history."
        });
    }
});


app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});


app.listen(PORT, () => {
    console.log(`Cafe Portal is running at http://localhost:${PORT}`);
});
