var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

var pool = mysql.createPool({
    host: 'amplifi-app-db.database.windows.net',
    user: 'amplifi',
    password: 'iHateAzure1',
    database: 'amplifi-app-db',
});
   
//User functions

//Login:
//POST username and password fields
//Returns {success: true} on success
router.post('/users/login', function(req, res, next) {
    
    if (req.body.username && req.body.password) {
        var inputUsername = mysql.escape(req.body.username);
        var inputPassword = mysql.escape(req.body.password);
        var query = "SELECT * FROM users WHERE username='" + inputUsername + "';";
        
        sqlQuery(query).then((result) => {    
            if (result[0] && bcrypt.compareSync(inputPassword, result[0].password)) {
                req.session.username = result[0].username;
                res.json({success: true});
            } else {
                res.json({error: "Error: login attempt failed."});
            }
        }).catch((err) => {
            res.json({error: err});
        });

    } else {
        res.json({error: "Error: insufficient information provided."});
    }
});


//Logout:
//Empty POST request
//Returns {success: true} when logged out
router.post('/users/logout', function(req, res, next) {
    if (req.session.username) {
        req.session.destroy();
        res.json({success: true});
    } else {
        res.json({error: "Error: you are not logged in."});
    }
});

//Create account:
//POST request with username and password
//Returns {success: true} on account creation (React redirect to login needed afterwards)
router.post('/users/createAccount', function(req, res, next) {
    if (req.body.username && req.body.password) {
        var inputUsername = mysql.escape(req.body.username);
        var inputPassword = mysql.escape(req.body.password);
        var query = "INSERT INTO users VALUES ('" + inputUsername + "', '" + bcrypt.hashSync(inputPassword) + "', '', '');";
        
        if (inputUsername.length > 0 && inputUsername.length <= 64 && inputUsername.value.match(/^[A-Za-z0-9]+$/)) {
            sqlQuery(query).then((result) => {    
                res.json({success: true});
            }).catch((err) => {
                res.json({error: err});
            });
        } else {
            res.json({error: "Error: username format is wrong. Only alphanumeric usernames up to 64 characters allowed."});
        }

    } else {
        res.json({error: "Error: insufficient information provided."});
    }
});

//Delete account:
//Empty POST request
//Returns {success: true} when deletion was successful (React redirect to home needed afterwards)
router.post('/users/deleteAccount', function(req, res, next) {
    if (req.session.username) {
        var query = "DELETE FROM users WHERE username = '" + req.session.username + "';";
        
        sqlQuery(query).then((result) => {
            req.session.destroy(); 
            res.json({success: true});
        }).catch((err) => {
            res.json({error: err});
        });

    } else {
        res.json({error: "Error: you are not logged in."});
    }
});

//Change followed user:
//POST request with username to follow/unfollow
//Returns {success: true}, whereupon the user was either followed or unfollowed (React can verify by requesting user data again and checking against list of followed users)
router.post('/users/changeFollowedUser', function(req, res, next) {
    if (req.body.username && req.session.username) {
        var inputUsername = mysql.escape(req.body.username);
        var query = "SELECT usersFollowing FROM users WHERE username='" + req.session.username + "';";
        
        sqlQuery(query).then((result) => {
            var inputUsersFollowing = inputUsername;
            
            if (result[0] && result[0].usersFollowing) {
                if (result[0].usersFollowing.split(',').contains(inputUsername)) {
                    inputUsersFollowing = result[0].usersFollowing.split(',').splice(result[0].usersFollowing.indexOf(inputUsername), 1).join();
                } else {
                    inputUsersFollowing = result[0].usersFollowing + "," + inputUsername;
                }
            }

            var query2 = "UPDATE users usersFollowing = '" + inputUsersFollowing + "' WHERE username = '" + req.session.username + "';"
            
            sqlQuery(query2).then((result) => {
                res.json({success: true});
            }).catch((err) => {
                res.json({error: err});
            });
        }).catch((err) => {
            res.json({error: err});
        });

    } else {
        res.json({error: "Error: follow action failed. Try reauthenticating or a different username to follow."});
    };
});

//Get user:
//POST request containing username to access data for
//Returns object containing userData: {username, usersFollowing, likedCards} and success: true
router.post('/users/getUser', function(req, res, next) {
    if (req.body.username) {
        var inputUsername = mysql.escape(req.body.username);
        var query = "SELECT username, usersFollowing, likedCards FROM users WHERE username='" + inputUsername + "';";

        sqlQuery(query).then((result) => {
            if (result[0]) {
                res.json({userData: result[0], success: true});
            } else {
                res.json({error: "Error: could not find user."});
            }
        }).catch((err) => {
            res.json({error: err});
        });
    } else {
        res.json({error: "Error: insufficient information provided."});
    }
});


//Card functions

//Create card:
//POST request with card text and link
//Returns {success: true} when completed (React needs to refresh after probably)
router.post('/cards/createCard', function(req, res, next) {
    if (req.session.username && req.body.text && req.body.link) {
        var inputText = mysql.escape(req.body.text);
        var inputLink = mysql.escape(req.body.link);
        var query = "INSERT INTO cards (owner, text, link, likes) VALUES ('" + req.session.username + "', n'" + inputText + "', '" + inputLink + "', 0);";
        
        sqlQuery(query).then((result) => {    
            res.json({success: true});
        }).catch((err) => {
            res.json({error: err});
        });

    } else {
        res.json({error: "Error: unable to create card."});
    }
});

//Update card:
//POST request with card id, text, and link: returns {success: true} when card updates
router.post('/cards/updateCard', function(req, res, next) {
    if (req.session.username && req.body.id && req.body.text && req.body.link) {
        var inputId = mysql.escape(req.body.id);
        var inputText = mysql.escape(req.body.text);
        var inputLink = mysql.escape(req.body.link);
        var query = "SELECT owner FROM cards WHERE id='" + inputId + "';";
        var query2 = "UPDATE cards text = '" + inputText + "', link = '" + inputLink + "' WHERE id = '" + inputId + "';";

        sqlQuery(query).then((result) => {
            if (result[0].owner == req.session.username) {
                sqlQuery(query2).then((result) => {
                    res.json({success: true});
                }).catch((err) => {
                    res.json({error: err});
                });
            } else {
                res.json({error: "Error: you do not have permissions to edit this card."});
            }
        }).catch((err) => {
            res.json({error: err});
        });

    } else {
        res.json({error: "Error: unable to update card."});
    }
});

//Change card like:
//POST request with card to like/unlike
//Returns {success: true}, whereupon the card was either liked or unliked (React can verify by requesting user data again and checking against list of liked cards)
router.post('/cards/changeCardLike', function(req, res, next) {
    if (req.session.username && req.body.id) {
        var inputId = mysql.escape(req.body.id); 
        var query = "SELECT likes FROM cards WHERE id='" + inputId + "';";
        var query2 = "SELECT likedCards FROM users WHERE username='" + req.session.username + "';";

        sqlQuery(query).then((result) => {
            var likes = result[0].likes;
            
            sqlQuery(query2).then((result) => {
                var inputLikedCards = inputId;
                
                if (result[0] && result[0].likedCards) {
                    if (result[0].likedCards.split(',').contains(inputId)) {
                        inputLikedCards = result[0].likedCards.split(',').splice(result[0].likedCards.indexOf(inputId), 1).join();
                    } else {
                        inputLikedCards = result[0].likedCards + "," + inputId;
                    }
                }
    
                var query3 = "UPDATE users likedCards = '" + inputLikedCards + "' WHERE username = '" + req.session.username + "';"
                sqlQuery(query3).then((result) => {
                    if (inputLikedCards.split(',').contains(inputId)) {
                        likes += 1;
                    } else if (likes > 0) {
                        likes -= 1;
                    }

                    var query4 = "UPDATE cards likes = '" + likes + "' WHERE id = '" + inputId + "';";
                    sqlQuery(query4).then((result) => {
                        res.json({success: true});
                    }).catch((err) => {
                        res.json({error: err});
                    });
                }).catch((err) => {
                    res.json({error: err});
                });
            }).catch((err) => {
                res.json({error: err});
            });    
        }).catch((err) => {
            res.json({error: err});
        });

    } else {
        res.json({error: "Error: like action failed."});
    };
});

//Get user:
//POST request containing card to access data for
//Returns object containing cardData: {id, owner, text, link, likes} and success: true
router.post('/cards/getCard', function(req, res, next) {
    if (req.body.id) {
        var inputId = mysql.escape(req.body.id);
        var query = "SELECT id, owner, text, link, likes FROM cards WHERE card='" + inputId + "';";

        sqlQuery(query).then((result) => {
            if (result[0]) {
                res.json({cardData: result[0], success: true});
            } else {
                res.json({error: "Error: could not find card."});
            }
        }).catch((err) => {
            res.json({error: err});
        });
    } else {
        res.json({error: "Error: insufficient information provided."});
    }
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
