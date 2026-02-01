require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const webhookHandler = require("./webhook"); // your webhook.js

const app = express();
app.use(express.json());

// Serve frontend HTML
app.use("/", express.static(path.join(__dirname, "frontend")));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Webhook GET (for testing)
app.post("/webhook", webhook);

// Webhook POST (Telegram will send updates here)
app.post("/webhook", async (req, res) => {
  console.log("POST /webhook received:", req.body); // logs every incoming Telegram update
  try {
    await webhookHandler(req, res); // delegate to your webhook logic
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.sendStatus(500);
  }
});

// Test route
app.get("/test", (req, res) => res.send("Server is working"));

// API to fetch uploaded files metadata
app.get("/files", async (req, res) => {
  try {
    const data = await fs.readJson("./data/files.json", { throws: false }) || [];
    res.json(data);
  } catch (err) {
    console.error("Error reading files.json:", err);
    res.json([]);
  }
});

// Ensure uploads folder exists
fs.ensureDirSync(path.join(__dirname, "uploads"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
