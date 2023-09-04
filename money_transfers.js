const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3306;

const db = mysql.createConnection({
    host: 'cai.aast.edu',
    user: 'web_11',
    password: '5950',
    database: 'web_11'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/money_transfers.html');
});

app.get('/getData', (req, res) => {
    const query = 'SELECT * FROM Money_Transfers';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
});

app.get('/transaction_history.html', (req, res) => {
    res.sendFile(__dirname + '/transaction_history.html');
});

app.get('/transaction_history', (req, res) => {
    // Fetch data from the database
    const query = 'SELECT transaction_id, sender, receiver, amount, timestamp FROM TransactionHistory';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error querying transaction history:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Send the transaction history data as JSON
        res.json(results);
    });
});


app.post('/transfer', (req, res) => {
    const senderName = req.body.SenderName.toLowerCase();
    const recipientName = req.body.RecipientName.toLowerCase();
    const amount = parseFloat(req.body.balance);

    function confirmBalance(name, cb) {
        const query = `SELECT balance FROM Money_Transfers WHERE name = ?`;

        db.query(query, [name], (err, result) => {
            if (err) {
                console.error('Error querying database:', err);
                cb(err, null);
                return;
            }

            cb(null, result);
        });
    }

    confirmBalance(senderName, function (error, senderResult) {
        if (error) {
            console.error('Error in confirmBalance:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Send Internal Server Error as JSON response
            return;
        }

        if (senderResult.length === 0) {
            res.status(400).json({ error: 'Invalid Sender Name' }); // Send Invalid Sender Name as JSON response
            return;
        }

        const senderCurrentBalance = senderResult[0].balance;
        const senderNewBalance = senderCurrentBalance - amount;

        if (senderNewBalance < 0) {
            res.status(400).json({ error: 'Insufficient Balance' }); // Send Insufficient Balance as JSON response
            return;
        }

        const senderUpdateQuery = `UPDATE Money_Transfers SET balance = ? WHERE name = ?`;

        db.query(senderUpdateQuery, [senderNewBalance, senderName], (err, senderUpdateResult) => {
            if (err) {
                console.error('Error updating sender balance:', err);
                res.status(500).json({ error: 'Internal Server Error' }); // Send Internal Server Error as JSON response
                return;
            }

            // Now, update the recipient's balance
            confirmBalance(recipientName, function (error, recipientResult) {
                if (error) {
                    console.error('Error in confirmBalance for recipient:', error);
                    res.status(500).json({ error: 'Internal Server Error' }); // Send Internal Server Error as JSON response
                    return;
                }

                if (recipientResult.length === 0) {
                    res.status(400).json({ error: 'Invalid Recipient Name' }); // Send Invalid Recipient Name as JSON response
                    return;
                }

                const recipientCurrentBalance = recipientResult[0].balance;
                const recipientNewBalance = recipientCurrentBalance + amount;

                const recipientUpdateQuery = `UPDATE Money_Transfers SET balance = ? WHERE name = ?`;

                db.query(recipientUpdateQuery, [recipientNewBalance, recipientName], (err, recipientUpdateResult) => {
                    if (err) {
                        console.error('Error updating recipient balance:', err);
                        res.status(500).json({ error: 'Internal Server Error' }); // Send Internal Server Error as JSON response
                        return;
                    }

                    // Insert the transaction into the TransactionHistory table
                    const insertTransactionQuery = 'INSERT INTO TransactionHistory (sender, receiver, amount, timestamp) VALUES (?, ?, ?, NOW())';

                    db.query(insertTransactionQuery, [senderName, recipientName, amount], (err, insertResult) => {
                        if (err) {
                            console.error('Error inserting transaction into TransactionHistory:', err);
                            res.status(500).json({ error: 'Internal Server Error' }); // Send Internal Server Error as JSON response
                            return;
                        }

                        const successMessage = `Money Transfer Successful from ${senderName} to ${recipientName}`;
                        console.log(successMessage);
                        // Inside the /transfer route after inserting the transaction

                        // Send a JSON response with the success message
                        res.status(200).json({ message: successMessage });
                    });
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
