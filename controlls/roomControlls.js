const { connection, purchasesmodul } = require('../database/MySQLDataBase')
const jwt = require('jsonwebtoken')
const LocalStorage = require('node-localstorage').LocalStorage;
const localstorage = new LocalStorage('./flosiTokens');
const { secret_token } = require('../config/config');
const dashbordControols = require('../controlls/dashbordControlls')

const flosi_roomId_get = (req,res) => {
    if (localstorage.getItem('id_room')) {
        jwt.verify(localstorage.getItem('id_room'), secret_token, (err,idRoom) => {
            if (err) {
                console.log(err);
                return;
            };
            const id_room = req.params.id;
            if (id_room == idRoom["id_room"]) {
                // select p_inveted
                connection.query('SELECT * FROM f_inveted WHERE id_room_inveted = ?', [id_room], (err,invetedResults) => {
                    if (err) throw err;
                    connection.query('SELECT * FROM rooms WHERE id_room = ?', [id_room] , (err,roomResults) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        jwt.verify(localstorage.getItem('signing_token'), secret_token, (err, user) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            connection.query('SELECT * from users', (err,userResults) => {
                                if (err) throw err;
                                userResults.forEach(userResult => {
                                    if (userResult.username == user["username"]) {
                                        purchasesmodul.find({ id_user: userResult.id_user }).then((purchases) => {
                                            let cpt = 0;
                                            userResults.forEach((userResult) => {
                                                if (userResult.email == user["email"]) {
                                                    if (roomResults[0].id_admin_user == userResult.id_user) {
                                                        res.render('room', {
                                                            title: roomResults[0].room_name + " room",
                                                            username: user["username"],
                                                            room_length: roomResults[0].room_length_personne,
                                                            friendsList: invetedResults,
                                                            createNotification: req.flash('createNotification'),
                                                            add_purchase: req.flash('sucess_add_purchase'),
                                                            purchases: purchases,
                                                            deleteAllMsg: req.flash('deleteAllMsg'),
                                                            addFriendmsg: req.flash('addFriendmsg'),
                                                            id: id_room,
                                                            isAdmin: true
                                                        });
                                                    }
                                                }
                                                cpt++;
                                            })
                                            if (cpt == 0) {
                                                res.render('room', {
                                                    title: roomResults[0].room_name + " room",
                                                    username: user["username"],
                                                    room_length: roomResults[0].room_length_personne,
                                                    friendsList: invetedResults,
                                                    createNotification: req.flash('createNotification'),
                                                    add_purchase: req.flash('sucess_add_purchase'),
                                                    purchases: purchases,
                                                    deleteAllMsg: req.flash('deleteAllMsg'),
                                                    addFriendmsg: req.flash('addFriendmsg'),
                                                    id: id_room,
                                                    isAdmin: false
                                                })
                                            }
                                        }).catch((err) => {
                                            console.log(err);
                                        })
                                    }
                                })
                            })
                        })
                    })
                })
            } else {
                req.flash('accessmsg', 'your id_room that you went to join is not possible for join it')
                res.redirect('/dashbord');
            }
        })
    } else {
        res.redirect('/dashbord');
    }
}

const flosi_getPurchases = (req,res) => {
    const id_room = req.params.id;
    purchasesmodul.find({ id_room: id_room }).then((purchases) => {
        res.send(purchases)
    }).catch((err) => {
        console.log(err);
    })        
}

const flosi_addPurchas_post = (req,res) => {
    const id_room = req.params.id;
    const nameOfProduct = req.body.nameOfProduct;
    const price = Number(req.body.price);
    const friend = req.body.friendCkeck;
    let friendCkeck = []
    connection.query('SELECT * FROM f_inveted WHERE id_room_inveted = ?', [id_room], (err, invetedResults) => {
        if (err) throw err;
        if (typeof friend == 'string') {
            invetedResults.forEach((invetedResult) => {
                if (invetedResult.name_inveted == friend) {
                    friendCkeck.push({
                        username: invetedResult.name_inveted, 
                        Consumption: 1
                    })
                }else {
                    friendCkeck.push({
                        username: invetedResult.name_inveted, 
                        Consumption: 0
                    })
                }
            })
        } else {
            invetedResults.forEach((invetedResult) => {
                let cpt = 0
                for (let i = 0; i < friend.length; i++) {
                    if (invetedResult.name_inveted == friend[i]) {
                        friendCkeck.push({
                            username: invetedResult.name_inveted, 
                            Consumption: 1
                        })
                        cpt++;
                        break;
                    }
                }
                if (cpt == 0 ) {
                    friendCkeck.push({
                        username: invetedResult.name_inveted, 
                        Consumption: 0
                    })
                }
            })
        }
        // insert friendCkeck to mongoDB
        jwt.verify(localstorage.getItem('signing_token'), secret_token, (err,user) => {
            if (err) throw err;
            connection.query('SELECT * FROM users WHERE username = ?', [user["username"]], (err,userResult) => {
                if (err) throw err;
                const newPurchase = new purchasesmodul({
                    id_user: userResult[0].id_user,
                    nameOfProduct: nameOfProduct,
                    price: price,
                    ckeckFriends: friendCkeck
                });
                newPurchase.save().then((rst) => {
                    req.flash('sucess_add_purchase', 'you are add a new purchase')
                    res.redirect(`/room/${id_room}`)
                }).catch((err) => {
                    console.error(err);
                });
            })
        });
    })
}

const flosi_deletePurchas_post = (req,res) => {
    const id_purchase = req.body.id_purchase;
    purchasesmodul.findByIdAndDelete({ _id: id_purchase }).then((data) => {
        console.log(data);
    }).catch((err) => {
        console.log(err);
    });
}

const flosi_updatePurchas_post = (req,res) => {
    const id_purchase = req.body.id_purchase;
    purchasesmodul.findByIdAndUpdate()
}

const flosi_deleteAll_purchases = (req,res) => {
    purchasesmodul.deleteMany({}, (err) => {
        if (err) {
          console.error('An error occurred while deleting purchases', err);
          res.status(500).send('An error occurred while deleting purchases');
        } else {
            req.flash('deleteAllMsg', 'all purchases was deleted')
            res.redirect(`/room/${req.params.id}`)
            console.log('All purchases deleted successfully');
        }
    });
}

const flosi_createJoin_another_room_post = (req,res) => {
    localstorage.removeItem("id_room");
    res.redirect('/dashbord');
}

const flosi_newFriend_post = (req,res) => {
    const newFriend = req.body.newFriend;
    const id_room = req.params.id;
    connection.query('SELECT username FROM users;', (err,usersResults) => {
        if (err) {
            console.log(err);
            return;
        }
        let cpt = 0;
        usersResults.forEach( (userResult) => {
            if (userResult.username == newFriend) {
                connection.query('INSERT INTO f_inveted (name_inveted,id_room_inveted) VALUES (?,?)', [newFriend,id_room], (err) => {
                    if (err) throw err;
                })
                req.flash('addFriendmsg', 'you are add '+ newFriend)
                cpt += 1;
                return;
            }
        });
        if (cpt == 0) {
            req.flash('addFriendmsg', newFriend + ' is not signing yet')
        }
    })
    res.redirect(`/room/${id_room}`)
}

const flosi_deleteFriend_post = (req,res) => {
    const friendCkecked = req.body.friendCkeck;
    if (typeof friendCkecked != "undefined") {
        if ( typeof friendCkecked == "string") {
            connection.query('DELETE FROM f_inveted WHERE name_inveted = ?', [friendCkecked], (err) => {
                if (err) throw err;
                req.flash('addFriendmsg', 'you are deleted'+friendCkecked)
            })
        } else {
            for (let i = 0; i < friendCkecked.length; i++) {
                connection.query('DELETE FROM f_inveted WHERE name_inveted = ?', [friendCkecked[i]], (err) => {
                    if (err) throw err;
                })
            }
            req.flash('addFriendmsg', 'you are deleted'+friendCkecked)
        }
        res.redirect(`/room/${req.params.id}`);
    }
}

const flosi_deleteRoom_post = (req,res) => {
    const id_room = req.params.id;
    connection.query('DELETE FROM rooms where id_room = ?', [id_room], (err) => {
        if (err) throw err;
        connection.query('DELETE FROM f_inveted where id_room_inveted = ?', [id_room], (err) => {
            if (err) throw err;
            localstorage.removeItem('id_room');
            req.flash('deleteRoomMsg', `${id_room} is deleted`);
            res.redirect('/dashbord')
            dashbordControols.friends = [];
        })
    })
}

module.exports = {
    flosi_roomId_get,
    flosi_getPurchases,
    flosi_addPurchas_post,
    flosi_deletePurchas_post,
    flosi_updatePurchas_post,
    flosi_deleteAll_purchases,
    flosi_createJoin_another_room_post, 
    flosi_newFriend_post,
    flosi_deleteFriend_post,
    flosi_deleteRoom_post
};