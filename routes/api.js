var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

var pool = mysql.createPool({
    host: 'amplifi-app-db.database.windows.net',
    user: 'ApiLogin',
    password: 'EpicLogin#2#',
    database: 'amplifi-app-db'
});
   
//User functions
router.post('/users/login', function(req, res, next) {
    
    if (req.body.username && req.body.password) {
        var inputUsername = mysql.escape(req.body.username);
        var query = "SELECT * FROM users WHERE username='" + inputUsername + "'";
        
        sqlQuery(query).then((result) => {    
            if (result.length == 1 && bcrypt.compareSync(req.body.password, result[0].password)) {
                req.session.username = result[0].username;
                res.json({success: true});
            } else {
                res.json({success: false});
            }
        }).catch((err) => {
            res.json({error: err});
        });

    } else {
        res.json({error: "Error: insufficient information provided."});
    }
});

router.post('/users/createAccount', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/users/deleteAccount', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/users/followUser', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/users/getUser', function(req, res, next) {
    res.send('respond with a resource');
});


//Card functions
router.post('/cards/createCard', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/cards/updateCard', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/cards/likeCard', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/cards/getCard', function(req, res, next) {
    res.send('respond with a resource');
});


//Website functions
router.post('/sitedata/:site', function(req, res, next) {
    res.send('respond with a resource');
});


//Perform a SQL query
function sqlQuery(query) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                return reject(err); 
            }
            
            connection.query(query, function(err, results) {
                connection.release();
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    });
}

module.exports = router;
