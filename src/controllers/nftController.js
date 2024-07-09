const { generateAndUploadToPinata } = require('../services/nftService');

async function generateAndUploadNFTHandler(req, res) {
  try {
    const { userName, score, date, qrData, courseName } = req.body;

    if (!userName || !score || !date || !qrData || !courseName) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const result = await generateAndUploadToPinata(userName, score, date, qrData, courseName);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating NFT:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { generateAndUploadNFTHandler };
