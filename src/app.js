const express = require('express');
const bodyParser = require('body-parser');
const nftRoutes = require('./routes/nftRoutes');

const app = express();

app.use(bodyParser.json());
app.use('/api/nft', nftRoutes);

module.exports = app;
