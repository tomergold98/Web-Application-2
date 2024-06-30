const express = require('express');
const mySer = express();
mySer.set("view engine", "ejs");
const mysql = require("mysql");
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "newdb",
});
const session = require('express-session');
mySer.use(session({
    secret: 'pac-course',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));
mySer.use(express.static("public"));
mySer.use(express.json());
mySer.use(express.urlencoded({ extended: true }));
 
mySer.get("/LoginPage", (req, res) => {
    const msg = req.session.msg;
    req.session.msg = null;
    res.render('LoginPage', { msg });
});
 
 
mySer.post('/LoginPage', (req, res) => {
    let email = req.body.doar;
    let pass = req.body.sisma;
    let query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    con.query(query, [email, pass], (err, results) => {
        if (err) throw err;
 
        if (results.length > 0) {
            req.session.isLogined = true;
            req.session.name = results[0].name;
            res.redirect('/WelcomePage');
        } else {
            req.session.msg = 'Invalid email or password';
            res.redirect('/LoginPage');
        }
    });
});
 
 
mySer.get("/Registration", (req, res) => {
    const msg1 = req.session.msg1;
    req.session.msg1 = null;
    res.render('Registration', { msg1 });
});
 
 
mySer.post("/Registration", (req, res) => {
    const { email, password, username } = req.body;
 
    con.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error checking email existence:', err);
            res.status(500).send('Internal server error');
            return;
        }
 
        if (results[0].count > 0) {
            req.session.msg1 = 'Email already exists';
            res.redirect('/Registration');
            return;
        }
 
        const insertQuery = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
        con.query(insertQuery, [email, password, username], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                res.status(500).send('Internal server error');
                return;
            }
            res.render('WelcomeRegistration', { username });
        });
    });
});
 
 
mySer.get("/WelcomePage", (req, res) => {
    const name = req.session.name;
    res.render('WelcomePage', { name });
});
 
mySer.post("/WelcomePage", (req, res) => {
    res.redirect("/list");
});
 
 
mySer.get("/list", (req, res) => {
    if (!req.session.isLogined) {
        res.redirect("/LoginPage");
        return;
    }
    res.render('list');
});
 
mySer.get('/api/users', (req, res) => {
    if (!req.session.isLogined) {
        res.redirect("/LoginPage");
        return;
    }
    const sql = "SELECT name, email FROM users";
    con.query(sql, function (err, result, fields) {
        if (err) {
            console.error('Error during query:', err);
            res.status(500).send('Internal server error');
            return;
        }
        res.json(result);
    });
});
 
mySer.listen(3000, () => { console.log("Server runs on port 3000"); })