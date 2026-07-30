require('dotenv').config();

const secret_token = process.env.SECRET_TOKEN || 'secret';
const db_user = process.env.DB_USER || 'root';
const db_password = process.env.DB_PASSWORD || '';
const db_name = process.env.DB_NAME || 'dataofflosi';
const db_host = process.env.DB_HOST || 'localhost';
const salt = process.env.SALT || '10';
const mongodb_url = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/dataofflosi';
const port = process.env.PORT || 5000;

module.exports = {
    secret_token,
    db_user,
    db_password,
    db_name,
    db_host,
    salt,
    mongodb_url,
    port
};