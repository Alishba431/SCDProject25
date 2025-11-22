// db/mongo.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const vaultEvents = require('../events');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "nodevault";
const COLLECTION_NAME = "records";

let client;

async function getCollection() {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }
    const db = client.db(DB_NAME);
    return db.collection(COLLECTION_NAME);
}

// Backup function
async function createBackup() {
    const col = await getCollection();
    const data = await col.find({}).toArray();
    const dir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Add Record
async function addRecord({ name, value }) {
    const col = await getCollection();
    const newRecord = { id: Date.now(), name, value };
    await col.insertOne(newRecord);
    vaultEvents.emit('recordAdded', newRecord);
    await createBackup();
    return newRecord;
}

// List Records
async function listRecords() {
    const col = await getCollection();
    return await col.find({}).toArray();
}

// Update Record
async function updateRecord(id, newName, newValue) {
    const col = await getCollection();
    const result = await col.findOneAndUpdate(
        { id },
        { $set: { name: newName, value: newValue } },
        { returnDocument: 'after' }
    );
    vaultEvents.emit('recordUpdated', result.value);
    await createBackup();
    return result.value;
}

// Delete Record
async function deleteRecord(id) {
    const col = await getCollection();
    const result = await col.findOneAndDelete({ id });
    vaultEvents.emit('recordDeleted', result.value);
    await createBackup();
    return result.value;
}

// Search Records
async function searchRecords(keyword) {
    const col = await getCollection();
    const regex = new RegExp(keyword, 'i');
    return await col.find({
        $or: [{ name: regex }, { id: { $regex: regex } }]
    }).toArray();
}

// Sort Records
async function sortRecords(field, order = 'asc') {
    const col = await getCollection();
    const sortOrder = order === 'asc' ? 1 : -1;
    return await col.find({}).sort({ [field]: sortOrder }).toArray();
}

// Export Records
async function exportData() {
    const col = await getCollection();
    const data = await col.find({}).toArray();
    const text =
        `Export Date: ${new Date().toISOString()}\n` +
        `Total Records: ${data.length}\n\n` +
        data.map(r => `ID: ${r.id}\nName: ${r.name}\nValue: ${r.value}\n---\n`).join("");
    fs.writeFileSync('export.txt', text);
}

// Statistics
async function getStatistics() {
    const col = await getCollection();
    const data = await col.find({}).toArray();
    if (data.length === 0) return {};

    return {
        total: data.length,
        lastModified: new Date(Math.max(...data.map(r => r.id))).toISOString(),
        longestName: data.reduce((a, b) => a.name.length > b.name.length ? a : b).name,
        earliest: new Date(Math.min(...data.map(r => r.id))).toISOString(),
        latest: new Date(Math.max(...data.map(r => r.id))).toISOString()
    };
}

module.exports = {
    addRecord,
    listRecords,
    updateRecord,
    deleteRecord,
    searchRecords,
    sortRecords,
    exportData,
    getStatistics
};

