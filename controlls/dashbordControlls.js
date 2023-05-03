const {connection} = require('../database/MySQLDataBase');
const jwt = require('jsonwebtoken')
const LocalStorage = require('node-localstorage').LocalStorage;
const localstorage = new LocalStorage('./flosiTokens');
const { secret_token } = require('../config/config');

let friends = []

const flosi_invet_post = (req,res) => {
    const friendName = req.body.invetFriend;
    connection.query('SELECT username FROM users', (err,results) => {
        if (err) throw err;
        let cpt = 0;
        results.forEach(result => {
            if (result.username.toLowerCase() == friendName.toLowerCase()) {
                if (friends.includes(friendName)) {
                    req.flash('notifactionInvet', 'this user is already inveted');
                }else {
                    friends.push(friendName)
                    req.flash('friendsList', friends)
                }
                cpt++;
                res.redirect('/dashbord');
                return;
            }
        })
        if (cpt == 0) {
            req.flash('notifactionInvet', 'this user is not signing yet');
            res.redirect('/dashbord')
        }
    })
}

const flosi_createRoomName_get = (req,res) => {
    if (friends.length != 0 && friends.length != 1) { 
        jwt.verify(localstorage.getItem('signing_token'), secret_token, (err, user) => {
            if (err) {
                console.log(err);
                return;
            }else {
                res.render('roomName', {
                  title: "createRoom name || join to Room",
                  username: user["username"]
                });
            }
        })
    } else {
        req.flash('notifactionInvet', 'please invet your friends')
        res.redirect('/dashbord')
    }
}

const flosi_fetchFriend_get = (req,res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Send the array as a JSON string
    connection.query('SELECT * FROM f_inveted', (err,invetedResults) => {
        if (err) throw err;
        // send notification in all users by the admin to join in room
        
        res.send(invetedResults);
    });
}

const flosi_joinRoom_post = (req,res) => {
    const id_room = req.body.codeRoom;
    connection.query('SELECT * FROM rooms WHERE id_room = ?', [id_room] ,(err,results) => {
        if (err) throw err;
        if (!results.length) {
            req.flash('joinNotification', 'this room is not exict yet')
            res.redirect('/dashbord');
        } else {
            jwt.verify(localstorage.getItem('signing_token'), secret_token, (err, user) => {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    connection.query('SELECT * FROM f_inveted', (err,invetedResults) => {
                        if (err) throw err;
                        let cpt = 0;
                        invetedResults.forEach( (invetedResult) => {
                            if (invetedResult.name_inveted.toLowerCase() == user["username"].toLowerCase() && invetedResult.id_room_inveted == id_room) {
                                cpt += 1;
                                return;
                            }
                        })
                        if (cpt == 0) {
                            connection.query('INSERT INTO f_inveted (name_inveted, id_room_inveted) VALUES (?,?)', [user["username"].toLowerCase(), id_room], (err) => {
                                if (err) throw err;
                            })
                        }
                        req.flash('createNotification', 'you are joined in room '+results[0].room_name)
                        jwt.sign( {id_room: id_room}, secret_token, (err,token) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            localstorage.setItem('id_room', token);
                            res.redirect(`/room/${id_room}`);
                        })
                    })
                }
            })
        }
    })
}

module.exports = {
    flosi_invet_post,
    flosi_createRoomName_get,
    friends,
    flosi_fetchFriend_get,
    flosi_joinRoom_post
}