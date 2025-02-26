const express = require('express');
const path = require('path')
const router = express.Router();
const OpenAI = require('openai');
const app = express();
const env = require('dotenv').config();
const bodyParser = require('body-parser');
const settings = require('./config');
const port = process.env.PORT || 3000; //which you can run both on Azure or local
const cors = require('cors');
const fs = require('fs');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const oneDay = 1000 * 60 * 60 * 24;
const { v4: uuidv4 } = require('uuid');

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'"
  );
  next();
});
console.log('start env');
//console.log(process.env.OPENAI_PROJECTID);
//console.log('end env');

//console.log(process.env.OPENAI_PROJECTID);
//console.log('projectid');

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_APIKEY,
//   project_id: process.env.OPENAI_PROJECTID
// });

//use sessions
app.use(cookieParser());

app.use(sessions({
  //key: 'session_cookie_user_auth',
  //name: 'SessionCookie',
  genid: function (req) {
    console.log('session id created');
    return uuidv4();
  }, // use UUIDs for session IDs  
  secret: 'heygensecret$$',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: true,
    secure: false,
    expires: false
  }
}));

app.use(cors());
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Include route files
const avatarRoute = require('./routes/openai');
const sesRoute = require('./routes/session');
const cmsRoute = require('./routes/cms');

// Use routes
app.use('/api/cms', cmsRoute);
app.use('/api/openai', avatarRoute);
app.use('/api/session', sesRoute);



//enable for publish and live
app.use(express.static(process.cwd() + '/client/dist'));



//app.get('/', (req, res) => {
//  res.sendFile(path.join(__dirname, '/client/dist', 'index.html'));
//});
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/dist/index.html');
});

app.use(express.static('public'))

app.get('/saraio-embed.js', (req, res) => {
  res.sendFile(process.cwd() + '/client/src/assets/js/default-embed-v3.js');
});

app.use("/themes", express.static(path.join(__dirname, '/themes')));



var server = app.listen(port, () => {
  console.log(`App is listening on port ${port} !`);
});

server.keepAliveTimeout = 30000;




//OLD LINES
//var options = {
//  index: 'index.html'
//};
//server.use(express.static('/client/dist/', options));

//const systemSetup = "You are a streaming avatar from HeyGen for sara.io, a new AI generation product that specialize in AI avatars and videos.\nYou are here to showcase how a HeyGen streaming avatar looks and talks.\nPlease note you are not equipped with any specific expertise or industry knowledge yet, which is to be provided when deployed to a real customer's use case.\nAudience will try to have a conversation with you, please try answer the questions or respond their comments naturally, and concisely. - please try your best to response with short answers, limit to one sentence per response, and only answer the last question."

//app.use(express.static(path.join(__dirname, '.')));
