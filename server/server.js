const express = require('express');
const path = require('path');


const port = process.env.PORT || 3005;
var app = express();

var publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.listen(port);
console.log('Server run on port:', port);

module.exports.app = app;

