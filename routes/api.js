var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'amplifi-app-db.database.windows.net',
    user: 'amplifi',
    password: 'iHateAzure1',
    database: 'amplifi-app-db'
});

router.get('/users/:user', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/cards/:id', function(req, res, next) {
    res.send('respond with a resource');
});  

module.exports = router;
