require('dotenv').config()

const secret_token = process.env.SECRET_TOKEN;
const db_password = process.env.DB_PASSWORD;
const salt = process.env.SALT;
const mongodb_password = process.env.MONGODB_PASSWORD;
const port = process.env.PORT

module.exports = {
    secret_token,
    db_password,
    salt,
    mongodb_password,
    port
};