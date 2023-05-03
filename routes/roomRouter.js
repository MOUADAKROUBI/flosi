const routeRoom = require('express').Router();
const roomControlls = require('../controlls/roomControlls');

routeRoom.get('/room/:id', roomControlls.flosi_roomId_get);

routeRoom.get('/room/:id/get_purchases', roomControlls.flosi_getPurchases)

routeRoom.post('/room/:id/add_purchase', roomControlls.flosi_addPurchas_post);

routeRoom.post('/room/:id/delete_purchase', roomControlls.flosi_deletePurchas_post)

routeRoom.post('/room/:id/update_purchase', roomControlls.flosi_updatePurchas_post)

routeRoom.delete('/room/:id/deleteAll_purchases', roomControlls.flosi_deleteAll_purchases);

routeRoom.post('/room/:id/createJoin_another_room', roomControlls.flosi_createJoin_another_room_post);

routeRoom.post('/room/:id/newFriend', roomControlls.flosi_newFriend_post)

routeRoom.post('/room/:id/deleteFriend', roomControlls.flosi_deleteFriend_post)

routeRoom.post('/room/:id/deleteRoom', roomControlls.flosi_deleteRoom_post)

module.exports = routeRoom;