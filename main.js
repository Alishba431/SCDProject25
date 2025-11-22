// main.js
const readline = require('readline');
const db = require('./db/mongo'); // MongoDB backend

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt user
function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function mainMenu() {
  while (true) {
    console.log('\n===== NodeVault =====');
    console.log('1. Add Record');
    console.log('2. List Records');
    console.log('3. Update Record');
    console.log('4. Delete Record');
    console.log('5. Exit');
    console.log('6. Search Records');
    console.log('7. Sort Records');
    console.log('8. Export Data');
    console.log('9. Display Statistics');
    console.log('=====================');

    const choice = await question('Choose option: ');

    switch (choice) {
      case '1':
        const name = await question('Enter name: ');
        const value = await question('Enter value: ');
        const added = await db.addRecord({ name, value });
        console.log('Record added:', added);
        break;

      case '2':
        const allRecords = await db.listRecords();
        console.table(allRecords);
        break;

      case '3':
        const updateId = parseInt(await question('Enter ID to update: '), 10);
        const newName = await question('Enter new name: ');
        const newValue = await question('Enter new value: ');
        const updated = await db.updateRecord(updateId, newName, newValue);
        if (updated) console.log('Updated:', updated);
        else console.log('Record not found');
        break;

      case '4':
        const deleteId = parseInt(await question('Enter ID to delete: '), 10);
        const deleted = await db.deleteRecord(deleteId);
        if (deleted) console.log('Deleted:', deleted);
        else console.log('Record not found');
        break;

      case '5':
        console.log('Exiting...');
        rl.close();
        process.exit(0);
        break;

      case '6':
        const keyword = await question('Enter search keyword: ');
        const results = await db.searchRecords(keyword);
        console.table(results);
        break;

      case '7':
        const field = await question('Sort by field (id/name): ');
        const order = await question('Order (asc/desc): ');
        const sorted = await db.sortRecords(field, order);
        console.table(sorted);
        break;

      case '8':
        await db.exportData();
        console.log('Data exported to export.txt');
        break;

      case '9':
        const stats = await db.getStatistics();
        console.log('Statistics:', stats);
        break;

      default:
        console.log('Invalid choice');
        break;
    }
  }
}

// Start the menu
mainMenu().catch(err => console.error(err));

