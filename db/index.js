const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const fs = require('fs');
const path = require('path');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { id: recordUtils.generateId(), name, value };
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
  fileDB.writeDB(data);
  createBackup(data);
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  vaultEvents.emit('recordDeleted', record);
   fileDB.writeDB(data);
  createBackup(data);
  return record;
}
function searchRecords(keyword) {
  const data = fileDB.readDB();
  keyword = keyword.toLowerCase();
  return data.filter(r =>
    r.name.toLowerCase().includes(keyword) ||
    String(r.id).includes(keyword)
  );
}
function sortRecords(field, order) {
  const data = fileDB.readDB();
  const sorted = [...data];

  sorted.sort((a, b) => {
    let x = field === 'date' ? a.id : a.name.toLowerCase();
    let y = field === 'date' ? b.id : b.name.toLowerCase();

    if (x < y) return order === 'asc' ? -1 : 1;
    if (x > y) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}
function exportData() {
  const data = fileDB.readDB();
  const text =
    `Export Date: ${new Date().toISOString()}\n` +
    `Total Records: ${data.length}\n\n` +
    data.map(r => `ID: ${r.id}\nName: ${r.name}\nValue: ${r.value}\n---\n`).join("");

  fs.writeFileSync('export.txt', text);
}
function createBackup(data) {
  const dir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}
function getStatistics() {
  const data = fileDB.readDB();
  if (data.length === 0) return {};

  return {
    total: data.length,
    lastModified: new Date(Math.max(...data.map(r => r.id))).toISOString(),
    longestName: data.reduce((a, b) => a.name.length > b.name.length ? a : b).name,
    earliest: new Date(Math.min(...data.map(r => r.id))).toISOString(),
    latest: new Date(Math.max(...data.map(r => r.id))).toISOString()
  };
}
 
module.exports = { addRecord, listRecords, updateRecord, deleteRecord, searchRecords, sortRecords, exportData, getStatistics };

