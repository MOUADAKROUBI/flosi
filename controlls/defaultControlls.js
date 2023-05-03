const { connection } = require('../database/MySQLDataBase')
const jwt = require('jsonwebtoken');
const LocalStorage = require('node-localstorage').LocalStorage;
const localstorage = new LocalStorage('./flosiTokens');
const { secret_token, salt } = require('../config/config');
const bcrypt = require('bcrypt');
const sendEmail = require('../sendMail');

const flosi_signIn_post = (req,res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.genSalt(Number(salt), (err,salt) => {
        if (err) throw err
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                console.error(err);
                return;
            } else {
                const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?);';
                const data = [username, email, hash];
                connection.query(sql, data, (err) => {
                    if (err) throw err;
                    jwt.sign({ username: username, email: email, password: hash }, secret_token, (err, token) => {
                        if (err) {
                            console.log(`this is an error in sign token`);
                            return;
                        } else {
                            localstorage.setItem('signing_token', token);
                            res.redirect('/dashbord');
                            return;
                        }
                    })
                })
            }
        })
    })
}

const flosi_logIn_post = (req,res) => {
  const email = req.body.emailenterd;
  const password = req.body.passwordentred;
  connection.query('SELECT * FROM users where email = ?;', [email], (err, results) => {
    if (err) throw err;
    if (results.length == 0) {
      req.flash('errorLogin', 'your email is incorrect');
      res.redirect('/home');
    }else {
      bcrypt.compare(password, results[0].password).then( rslt => {
        if (rslt) {
            jwt.sign({ username: results[0].username, email: email, password: results[0].password }, secret_token, (err, token) => {
              if (err) {
                  console.log(`this is an error in sign token`);
                  return;
              } else {
                  localstorage.setItem('signing_token', token);
                  res.redirect('/dashbord');
                  return;
              }
            })
        }else {
          req.flash('errorLogin', 'your password is incorrect');
          res.redirect('/home');
        }
      })
      .catch((err) => {
          console.log(err);
      })
    }
  })
}

const flosi_friegnkey_get = (req,res) => {
    res.render('forgennePassword', {
        title: 'foreign Password || flosi',
        notification: req.flash('notification')
    })
}

const number = Math.floor(9999 + Math.random() * (99999 - 9999))
const flosi_friegnkey_post = (req,res) => {
    const email = req.body.email;
    connection.query("SELECT * FROM users WHERE email = ?", [email], (err,results) => {
      if (err) throw err;
      if (results.length == 0) {
        req.flash('notification', 'your email is incorrect or you are not sign yet')
        res.redirect('/forgetPassword')
      }else {
        sendEmail("mouadakroubi@gmail.com", email, "forieng key", `your code is ${number}`)
        res.redirect('/code');
      }
    })
}

const flosi_codeForeign_get = (req,res) => {
    res.render('codeEntered', { title: "enter your code", notification: req.flash('notification') });
}

const flosi_codeForeign_post = (req,res) => {
    const codeEntered = req.body.code;
    if (codeEntered == number) {
        res.redirect('/newPass')
    } else {
        req.flash('notification', 'your code that you entered is incorrect')
        res.redirect('/code');
    }
}


const flosi_newPass_get = (req,res) => {
    res.render('newPassword', { title: "new pasword" })
}

const flosi_newPass_post = (req,res) => {
    const password = req.body.newPass;
    const repassword = req.body.reNewPass;
    if (password == repassword) {
      bcrypt.genSalt(Number(salt), (err,salt) => {
          if (err) throw err
          bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err; 
              const data = [hash, id_user]
              connection.query('UPDATE users SET password = ? WHERE id_user = ?',data ,(err,results) => {
                  if (err) throw err
                  req.flash('newPassNotifacation', 'your password is enregestrie')
              })
          })
      })
    } else {
        req.flash('newPassNotifacation', 'your new password is not matched')
    }

    res.redirect('/home')
}

const flosi_signOut = (req,res) => {
    localstorage.clear()
    res.redirect('/');
}

module.exports = {
    flosi_signIn_post,
    flosi_logIn_post,
    flosi_friegnkey_get,
    flosi_friegnkey_post,
    flosi_codeForeign_get,
    flosi_codeForeign_post,
    flosi_newPass_get,
    flosi_newPass_post,
    flosi_signOut
}