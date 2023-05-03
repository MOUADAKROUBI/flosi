// dashbord || room
const {connection} = require('../database/MySQLDataBase')
const jwt = require('jsonwebtoken')
const LocalStorage = require('node-localstorage').LocalStorage;
const localstorage = new LocalStorage('./flosiTokens');
const { secret_token } = require('../config/config');
const routeDashbord = require('express').Router();
const dashbordControols = require('../controlls/dashbordControlls')
const crypto = require('crypto');
const sendEmail = require('../sendMail');

connection.query('SELECT * FROM users;', (err, usersResults) => {
    if (err) throw err;
    routeDashbord.get('/dashbord', (req,res) => {
        if (localstorage.getItem('signing_token')) {
            if (localstorage.getItem('id_room')) {
                jwt.verify(localstorage.getItem('id_room'), secret_token, (err, id_room) => {
                    if (err) {
                        console.log(`this is an error in verifay token`);
                        return;
                    } else {
                        res.redirect(`/room/${id_room["id_room"]}`)
                        return;
                    }
                })
            } 
            else {
                jwt.verify(localstorage.getItem('signing_token'), secret_token, (err, user) => {
                    if (err) {
                        console.log(`this is an error in verifay token`);
                        return;
                    } else {
                        usersResults.forEach(userResult => {
                            if (user["email"] == userResult.email && user["password"] == userResult.password) {
                                res.render('dashbord', {
                                    title: "dashbord || flosi",
                                    username: userResult.username,
                                    friendsList: req.flash('friendsList'),
                                    notifactionInvet: req.flash('notifactionInvet'),
                                    joinNotification: req.flash('joinNotification'),
                                    accessmsg: req.flash('accessmsg'),
                                    deleteRoomMsg: req.flash('deleteRoomMsg')
                                })
                            }
                        })
                    } 
                });
            }
        }else {
            res.redirect('/home');
        }
    })
});

routeDashbord.post('/invet', dashbordControols.flosi_invet_post)

routeDashbord.get('/createRoomName', dashbordControols.flosi_createRoomName_get)

routeDashbord.post('/goBack', (req,res) => {
    res.redirect('/dashbord')
});

connection.query('SELECT * FROM users;', (err,userResult) => {
    if (err) throw err;
    routeDashbord.post('/roomName', (req,res) => {
        const id_room = crypto.randomBytes(10).toString("hex").slice(0, 20);
        const roomName = req.body.roomName;
        let data = []
        jwt.verify(localstorage.getItem('signing_token'), secret_token, (err, user) => {
            if (err) {
                console.log(err);
                return;
            } else {
                for (let i = 0; i < userResult.length; i++) {
                    if (userResult[i].username == user["username"].toLowerCase()) {
                        data = [ id_room, roomName, dashbordControols.friends.length, userResult[i].id_user ];
                        break;
                    }
                }
                dashbordControols.friends.push(user["username"].toLowerCase())
            }
        })
        connection.query('INSERT INTO rooms VALUES (?,?,?,?);', data, (err, result) => {
            if (err) throw err;
            if (!result.fieldCount) {
                for (let i = 0; i < dashbordControols.friends.length; i++) {
                    connection.query(`INSERT INTO f_inveted (name_inveted, id_room_inveted) VALUES (?,?)`, [ dashbordControols.friends[i], id_room ], (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    })
                }
                
                req.flash('createNotification', `you are created a new room that id: ${id_room}`)
                jwt.sign( {id_room: id_room}, secret_token, (err,token) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    localstorage.setItem('id_room', token);
                    res.redirect(`/room/${id_room}`);
                    // her i went to send emails to inveted
                    connection.query('SELECT * FROM rooms WHERE id_room = ?', [id_room], (err,roomResult) => {
                        if (err) throw err;
                        let emailAdmin = "";
                        connection.query('SELECT * FROM users WHERE id_user = ?', [roomResult[0].id_admin_user], (err,userResult) => {
                            if (err) throw err;
                            emailAdmin = userResult[0].email;
                            connection.query('SELECT * FROM f_inveted WHERE id_room_inveted = ?', [id_room], (err,invetedResults) => {
                                if (err) throw err;
                                invetedResults.forEach( (invetedResult) => {
                                    connection.query('SELECT * FROM users WHERE username = ?', [invetedResult.name_inveted], (err, userResult) => {
                                        if (err) throw err;
                                        if (userResult[0].email != emailAdmin) {
                                            sendEmail(emailAdmin, userResult[0].email, "join to room", `you are inveted to join in room that id: ${id_room}`)
                                        }
                                    })
                                })
                            })
                        })
                    })
                })
            }
        })
    })
});

routeDashbord.get('/friends', dashbordControols.flosi_fetchFriend_get)

routeDashbord.post('/joinRoom', dashbordControols.flosi_joinRoom_post)

module.exports = routeDashbord;