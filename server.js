//Install express server
const express = require('express');
const path = require('path');
const request = require('request');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/brewmon-cli'));

app.get('/data/*', function(req,res) {
  var apiURL = process.env.BREWMON_SRV_APP_URL + req.url;
  request(apiURL).pipe(res);
});

app.get('/*', function(req,res) {
    
res.sendFile(path.join(__dirname+'/dist/brewmon-cli/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);