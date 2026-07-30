const mysql = require('mysql2');
const { db_user, db_password, db_name, db_host, mongodb_url } = require('../config/config');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose.connect(mongodb_url)
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((err) => {
    console.log("❌ Failed to connect to MongoDB")
    console.log('MongoDB connection error:', err.message);
});

const purchasesSchema = new mongoose.Schema({
    id_user: {
        type: Number,
        required: true
    },
    id_room: {
        type: String,
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

const purchasesmodul = mongoose.model('purchases', purchasesSchema);

const connection = mysql.createConnection({
    host: db_host,
    database: db_name,
    user: db_user,
    password: db_password,
});

module.exports = {
    connection,
    purchasesmodul
};