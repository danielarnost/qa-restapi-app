'use strict';
//MOOVED FROM q-a-rest-api!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//added from client-app
const path = require("path");
const rootpath = path.normalize(__dirname + '/q&a-app');
//==============================================================
//added from error when moved ino client app
const mongoose      = require("mongoose");



const express = require ('express');
const app = express();
const routes = require("./routes");

const jsonParser = require('body-parser').json; //only using json funcitonality of body parser i this app
const logger = require('morgan');


app.use(logger("dev"));
app.use(jsonParser()); //when app recieves a req, this midware will pass req body as json and be accessible thru req.body property

//added from client app
app.use(express.static(rootpath));
//templates just guessing here because they use handlebars... is this covered in serving static rootpath?
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/q&a-app/js/templates')
//=================================================================

mongoose.connect("mongodb://localhost:27017/sandbox");

const db  = mongoose.connection;

db.on("error", (err) => console.error("Connection error:", err));  

db.once("open", () => {
  console.log("db connection successful");
});

//cross origin resours sharing CORS => security risk, restricions 
//grant access to any domain a cross origin request. Our API gives permission for any client
app.use((req, res, next) => {
  res.header("Access-Control-allow-Origin", "*");// restrict domains  this api can respond to, * any domain, no reestrictions
  res.header("Access-Control-allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
  if(req.method === "OPTIONS"){
      res.header("Access-Control-allow-Mrthods", "PUT,POST,DELETE");
      return res.status(200).json({})
    }
  next();
});

app.use("/questions", routes);

//catch 404 and forwar to error handler
app.use((req, res, next) => {
    const err = new Error ("Not found");
    err.status = 404;
    next(err)
});

//error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
          error:{
             message: err.message
          }
    });
});


const port = process.env.port || 3000;

app.listen(port, function(){
  console.log('express server is listening on port', port)
});