// home || sign in || log in || foreign key || sign out
const express = require('express');
const router = express.Router();
const {connection} = require('../database/MySQLDataBase')
const fs = require('fs');
const { check } = require('express-validator');
const LocalStorage = require('node-localstorage').LocalStorage;
const localstorage = new LocalStorage('./flosiTokens');
const jwt = require('jsonwebtoken');
const { secret_token } = require('../config/config');
const defaultControlls = require('../controlls/defaultControlls')

router.get('/', (req,res) => {
    res.redirect('/home');
})

connection.query('SELECT * FROM users;', (err, results) => {
    if (err) throw err;
    router.get('/home', (req, res) => {
        if (localstorage.getItem('signing_token')) {
            jwt.verify(localstorage.getItem('signing_token'), secret_token, (err, user) => {
                if (err) {
                    console.log(`this is an error in verifay token`);
                    return;
                } else {
                    results.forEach(result => {
                        if (result.email == user["email"] && result.password == user["password"]) {
                            res.redirect('/dashbord')
                            return;
                        }   
                    })
                } 
            });
        }
        else {
            res.render('home', {
                title: 'flosi || log in or sign in',
                emsg: req.flash('errors_msg'),
                logInmsg: req.flash('errorLogin'),
                newPassNoti: req.flash('newPassNotifacation')
            });
        }
    });
})

let regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#\$%&]).+$/;
router.post('/signIn',defaultControlls.flosi_signIn_post);

router.post('/logIn', defaultControlls.flosi_logIn_post);

router.get('/forgetPassword', defaultControlls.flosi_friegnkey_get);

router.post('/forgetPassword', defaultControlls.flosi_friegnkey_post)

router.get('/code', defaultControlls.flosi_codeForeign_get)

router.post('/code', defaultControlls.flosi_codeForeign_post)

router.get('/newPass', defaultControlls.flosi_newPass_get)

router.post('/newPass', defaultControlls.flosi_newPass_post)

router.post('/signOut', defaultControlls.flosi_signOut);

module.exports = router