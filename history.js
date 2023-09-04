const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3306; // Adjust the port as needed

// Create a MySQL database connection
const db = mysql.createConnection({
    host: 'cai.aast.edu',       // Replace with your MySQL server hostname
    user: 'web_11',          // Replace with your MySQL username
    password: '5950',       // Replace with your MySQL password
    database: 'web_11'
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Use bodyParser middleware to parse POST data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve your HTML files and other static assets as needed

// Retrieve transaction history data
app.get('/transactionHistory', (req, res) => {
    const query = 'SELECT * FROM TransactionHistory ORDER BY timestamp DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error querying transaction history:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Implement the money transfer and transaction history insertion endpoints here

// Start the Express.js server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
