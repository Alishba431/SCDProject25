const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { id: recordUtils.generateId(), name, value };
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
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
function exportData() {
  const data = fileDB.readDB();
  const text =
    `Export Date: ${new Date().toISOString()}\n` +
    `Total Records: ${data.length}\n\n` +
    data.map(r => `ID: ${r.id}\nName: ${r.name}\nValue: ${r.value}\n---\n`).join("");

  fs.writeFileSync('export.txt', text);
}

  return sorted;
}
module.exports = { addRecord, listRecords, updateRecord, deleteRecord, searchRecords, sortRecords, exportData };

