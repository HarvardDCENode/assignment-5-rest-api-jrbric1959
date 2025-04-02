// app.js

const express = require('express');
const path = require('path');
const photos = require('./routes/photos');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
// connect to MongoDB database @cluster0.yqrjb.mongodb.net/photoDB
mongoose.connect(process.env.MONGO_URI, {  
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.catch((err)=>{   // if mongoose fails to connect, err is error object
  console.error(`database connection error: ${err}`); // log error to console
  process.exit(); // global object stop Node.js if DB connection error
});
app.use(cookieParser('cscie31-secret')); // parse/manage cookies, create req.cookies
app.use(cookieParser('cscie31-secret')); // Parse and sign cookies
app.use(session({ // use express-session to handle user sessions and store session data on server
  secret:"cscie31",
  resave: "true",
  saveUninitialized: "true"
}));
// parse urlencoded data in body of req, false: simple values/arrays in body
app.use(bodyparser.urlencoded({extended: false}));
app.set('views', path.join(__dirname, 'views'));  // set path to views folder
app.set('view engine', 'pug'); // use pug templating engine
// Set ../public as static route to /img directory for storing uploaded images
app.use('/static', express.static(path.join(__dirname, 'public')));
  // the real business of our app, the route for /photos, which 
  // is handled by the photos router
app.use('/photos', photos); // set /photos as base path to routing  fo 
app.get('/', (req, res) => {
  res.render('homepage'); // This will render views/homepage.pug
});
app.use((req, res, next)=>{  // if routes above not requested
  var err = new Error(`Resource Not Found ${req.url}`);  // error message
  err.status = 404;  // err status set to 404
  next(err);
});
app.use((err, req, res, next)=>{
  if (err.status == 404){  // if err.status = 404
    res.status(404).send(`Cannot find ${req.url}`); // send message with url
  } 
});

module.exports = app;
