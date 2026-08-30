const mysql = require('mysql2');

// CHANGE the password below to your own MySQL root password
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '58658532',
    database: 'blood_donation_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = db;
