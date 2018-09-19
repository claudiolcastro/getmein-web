// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
const axios = require('axios');
var nodemailer = require('nodemailer');
var createMail = require('./createmail');
var urlcrypt = require('url-crypt')('~{ry*I)44==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');
var rsa = require('node-rsa');
let mail = process.env.EMAIL;
let password = process.env.PASSWORD;
const token = process.env.SECRET
const b13 = process.env.B13
const b14 = process.env.B14
const b15 = process.env.B15
const b16 = process.env.B16
const b17 = process.env.B17
const b18 = process.env.B18
const outs = process.env.OUTS

const key = new rsa({b: 512});

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

var dict = {};
dict['2013'] = b13;
dict['2014'] = b14;
dict['2015'] = b15;
dict['2016'] = b16;
dict['2017'] = b17;
dict['2018'] = b18;
dict['outsider'] = outs;

// Testing 

app.get('/verify/:base64', (req, res, next) => {
  const encryptedData = req.params.base64;
  var data;
  const pass = true;
  try {
    data = urlcrypt.decryptObj(encryptedData);
  } catch (e) {
    res.send("Invalid Link.");
    pass = false;
  } 

  if ( pass ) {
    res.redirect('https://github.com/orgs/iiitv/teams');
  }
  res.end();
});


app.get("/sendmail/:username/:id", (request, response, next) => {
  const username = request.params.username;
  const id = request.params.id;
  const base64 = urlcrypt.cryptObj({
    id: id,
    username: username
  });
  
  const verificationurl = 'http://localhost:3000/verify/' + base64;

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mail,
      pass: password,
    }
  });

  var mailOptions = {
    from: '"IIITV Coding Club" <codingclub@iiitv.ac.in>',
    to: id,
    //cc: mail,
    subject: 'Invitation to join IIITV Organization on GitHub',
    html: createMail.createMail(username, verificationurl),
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      response.sendStatus(500);
    } else {
      response.sendStatus(200);
    }
  });

  next();

});

app.get("/add", (request, response) => {
  let pref = request.query.email.substring(0, 4);
  let checkInsti = request.query.email.split('@')[1];
  if(checkInsti === "iiitv.ac.in" || checkInsti === "iiitvadodara.ac.in") {
    console.log("IIITian");
  }
  else {
    pref = 'outsider';
  }
  console.log(pref)
  let url = "https://api.github.com/teams/" + dict[pref] + "/memberships/" + request.query.username + "?access_token=" + token;
  console.log(url);
  
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mail,
      pass: password,
    }
  });

  var mailOptions = {
    from: '"IIITV Coding Club" <codingclub@iiitv.ac.in>',
    to: request.query.email,
    subject: 'Invitation to join iiitv on GitHub',
    text: 'Hi, ' + request.query.username + '\nTo join click on the link: '
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  
  
  axios.put(url)
  .then(response => {
    console.log(response.data.url);
  })
  .catch(error => {
    console.log(error);
  });
})

app.get('/verify/:hash', (request, response) => {
  const hash = request.params.hash;
  response.send(hash);
  response.end();
});

// listen for requests :)
const listener = app.listen( 3000 || process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
