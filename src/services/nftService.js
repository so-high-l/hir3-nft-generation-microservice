const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');
const path = require('path');
require('dotenv').config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const url =  process.env.IPFS_PIN_URL;


// Function to generate certificate
async function generateCertificate(userName, score, qrData, date, courseName) {
  const templatePath = path.join(__dirname, '..', 'assets', 'template', 'template.png');
  const template = await loadImage(templatePath);
  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(template, 0, 0);
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#203D58';

  ctx.fillText("HIR3", 480, 180);
  ctx.fillText("Certificate Of Completion", 390, 210);
  ctx.fillText(`This certificate is awarded to ${userName}`, 340, 680);
  ctx.fillText(`for the successful completion of the course`, 310, 700);
  ctx.fillText(`${courseName} with a score of ${score}`, 400, 720);
  ctx.fillText(`Congratulations on your achievement`, 340, 750);
  ctx.fillText(`and dedication`, 430, 770);
  ctx.fillText(date, 450, 800);

  // Adjusted QR code settings
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'L',
    type: 'image/png',
    width: 100, // Smaller width
    margin: 1 // Smaller margin
  });

  const qrCodeImage = await loadImage(qrCodeDataUrl);

  // Draw red background
  const qrX = 866; // X position of QR code
  const qrY = 866; // Y position of QR code
  const qrWidth = 100; // QR code width
  const qrHeight = 100; // QR code height
  ctx.fillStyle = 'red';
  ctx.fillRect(qrX, qrY, qrWidth, qrHeight);

  // Draw QR code on top of red background
  ctx.drawImage(qrCodeImage, qrX, qrY, qrWidth, qrHeight);

  const outputPath = path.join(__dirname, '..', 'assets', 'output', 'generated_certificate.png');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const out = fs.createWriteStream(outputPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  await new Promise(resolve => out.on('finish', resolve));

  return outputPath;
}

// Function to upload file to Pinata
async function uploadToPinata(filePath) {

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const headers = {
    pinata_api_key: pinataApiKey,
    pinata_secret_api_key: pinataApiSecret,
    ...form.getHeaders()
  };

  try {
    const response = await axios.post(url, form, { headers });
    return response.data.IpfsHash;
  } catch (err) {
    console.error('Error uploading to Pinata:', err.response ? err.response.data : err.message);
    throw err;
  }
}

// Example usage
// @note add checks for null or undefined
async function generateAndUploadToPinata(userName, score, date, qrData, courseName) {
  try {
    const outputPath = await generateCertificate(userName, score, qrData, date, courseName);
    const certificateIpfsHash = await uploadToPinata(outputPath);
    const imageHash = `ipfs://${certificateIpfsHash}`;

    const metadata = {
      name: 'Quiz Certificate NFT',
      description: 'Certificate for completing the quiz',
      image: `ipfs://${certificateIpfsHash}`,
      attributes: [
        { trait_type: 'Name', value: userName },
        { trait_type: 'Score', value: score },
        { trait_type: 'Date', value: date },
      ],
    };

    const metadataPath = path.join(__dirname, '..', 'assets', 'output', 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    const metadataIpfsHash = await uploadToPinata(metadataPath);
    const metadataIpfsUrl = `ipfs://${metadataIpfsHash}`;

    return {
      metadataHash: metadataIpfsUrl,
      imageHash: imageHash
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = { generateAndUploadToPinata };
