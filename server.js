require('dotenv').config();

const path = require('path');
const express = require('express'); 
const faker = require('faker');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.use(function(req, res, next){
  console.log("Request from: ", req.url);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/token', (req, res) => {
  const identity = faker.name.findName();
  const token = new AccessToken(
    process.env.TWILIO_SID,
    process.env.TWILIO_KEY_SID,
    process.env.TWILIO_KEY_SECRET,
  );

  token.identity = identity;

  const grant = new VideoGrant({
    room: "Where is Jessica Hyde?"
  });

  token.addGrant(grant);

  res.send({
    identity,
    token: token.toJwt()
  });

});

app.listen(process.env.PORT || 8080);
