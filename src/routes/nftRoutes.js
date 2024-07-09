const express = require('express');
const { generateAndUploadNFTHandler } = require('../controllers/nftController');

const router = express.Router();

router.post('/generateAndUpload', generateAndUploadNFTHandler);

module.exports = router;
