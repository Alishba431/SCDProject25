const express = require("express");
const db = require("./db"); // uses your existing add/list/update/delete logic
require("./events/logger");

const app = express();
app.use(express.json());

// GET /
app.get("/", (req, res) => {
  res.send("NodeVault API is running!");
});

// GET /records
app.get("/records", (req, res) => {
  res.json(db.listRecords());
});

// POST /records
app.post("/records", (req, res) => {
  const record = db.addRecord(req.body);
  res.json({ message: "Record added", record });
});

// PUT /records/:id
app.put("/records/:id", (req, res) => {
  const updated = db.updateRecord(Number(req.params.id), req.body.name, req.body.value);
  updated ? res.json(updated) : res.status(404).json({ error: "Not found" });
});

// DELETE /records/:id
app.delete("/records/:id", (req, res) => {
  const deleted = db.deleteRecord(Number(req.params.id));
  deleted ? res.json(deleted) : res.status(404).json({ error: "Not found" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

