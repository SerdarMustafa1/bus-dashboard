const mysql = require('mysql');

const dbData = require('./config/site').databaseConnection;
const databaseName = 'busapp';

function initStart() {
  for (const table of Object.values(require('./models/mysql/table/tables'))) {
    db.query(table, null, (err) => {
      if (err) {
        console.log('TABLE ERROR', table);
        console.log('Error', err);
      }
    });
  }
  require('./workers/initialize')();
}

const db = mysql.createConnection(dbData);

db.connect((err) => {
  if (err) console.log('error when connecting to db:', err);
  else {
    console.log('\x1b[32mMySQL Connected...', '\x1b[0m');

    db.query('CREATE DATABASE IF NOT EXISTS busapp;', null, (err, data) => {
      if (err) {
        console.log('DATABASE CREATE ERROR');
        console.log('Error', err);
      }
      db.query('use ' + databaseName, null, (err) => {
        if (err) {
          console.log('Error', err);
          throw err;
        }
        initStart();
      });
    });
  }
});

module.exports = db;
