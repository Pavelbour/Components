require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.post('/auth/v1/create-user', async (req, res) => {
    try {
        const request = 'SELECT user_name, email FROM users_table WHERE user_name = $1 OR email = $2';
        const user = await db.query(request, [req.body.name, req.body.email]);

        console.log(user.rows);
        
        if (user.rows.length !== 0) {
            res.sendStatus(403);
        } else {
            await db.query('INSERT INTO users_table (user_name, email, hashed_password) VALUES ($1, $2, $3)', [req.body.name, req.body.email, req.body.password]);
            res.sendStatus(201);
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    };
})

app.post('/auth/v1/update-user', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            try {
                console.log(authData);
                db.query('UPDATE users_table SET user_name = $1, hashed_password = $2, email = $3 WHERE user_name = $4', [req.body.name, req.body.password, req.body.email, authData.user.user_name]);
                res.sendStatus(205);
            } catch (err) {
                res.sendStatus(500);
            }
        }
    });
    
})

app.post('/auth/v1/login', async (req,res) => {
    try {
        const result = await db.query('SELECT user_id, user_name, hashed_password, email FROM users_table WHERE user_name=$1', [req.body.name]);

        if (result.rows.length == 0) {
            res.sendStatus(403);
        }
        
        const user = result.rows[0];
        
        if (user.hashed_password == req.body.password) {
            jwt.sign({user}, 'secretkey', (err, token) => {
                res.json({
                    token
                })
            });
        } else {
            res.sendStatus(403);
        }
    } catch (err) {
        res.sendStatus(500);
    }
})

app.post('/auth/v1/restore-password', async (req, res) => {
    try {
        const result = await db.query('SELECT email FROM users_table WHERE email = $1', [req.body.email]);

        if (result.rows.length == 0) {
            res.sendStatus(403);
        }
        
        const newPassword = randomPassword();
        
        await db.query('UPDATE users_table SET hashed_password = $1 WHERE email = $2', [newPassword, req.body.email]);

        sendConfirmation();

        res.sendStatus(205);

    } catch (err) {

    }
})

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

function randomPassword(){
    // TODO: implementer the function;
    return 'random_password';
}

function sendConfirmation(){
    // TODO: implementer the function;
    console.log('Your password was changed.');
}

app.listen(port, () => console.log(`Server started on port ${port}`));