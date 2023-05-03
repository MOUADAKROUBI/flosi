const mysql = require('mysql2');
const { db_password, mongodb_password } = require('../config/config');
const mongoose = require('mongoose')

mongoose.connect(mongodb_password)

const purchasesSchema = new mongoose.Schema({
    id_user: {
        type: Number,
        required: true
    },
    nameOfProduct: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    ckeckFriends: {
        type: Array,
        required: true
    }
});

const connection = mysql.createConnection({
    user: "mouadakroubi",
    password: db_password,
    database: "dataofflosi"
});

const purchasesmodul = mongoose.model('purchases', purchasesSchema)

module.exports = {
    connection,
    purchasesmodul
};