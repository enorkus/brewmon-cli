//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/brewmon-cli'));

app.get('/*', function(req,res) {
    
res.sendFile(path.join(__dirname+'/dist/brewmon-cli/index.html'));
});

app.get('/data', (req, res) => {
    res.json({url: process.env.BREWMON_SRV_APP_URL})
  });

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);