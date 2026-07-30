const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const routeDefault = require('./routes/defaultRoute');
const routedashboard = require('./routes/dashboardRoute');
const routeRoom = require('./routes/roomRouter');
const { port, mongodb_url } = require('./config/config')
const MongoDBStore = require('connect-mongodb-session')(session);
const crypto = require('crypto');
const app = express();

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/image', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser('keyboard cat'));
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


const store = new MongoDBStore({
  uri: mongodb_url,
  collection: 'sessions',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
});

const secret = crypto.randomBytes(32).toString('hex');
const sessionMiddleware = session({
  secret: secret,
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

app.use(sessionMiddleware);

app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  console.log(`You have visited this page ${req.session.views} times`);
  res.redirect('/home')
})

app.use(routeDefault);
app.use(routedashboard);
app.use(routeRoom);

const PORT = port || 5000;
app.listen(PORT, () => {
  console.log(`The server is running at http://localhost:${PORT}`);
});