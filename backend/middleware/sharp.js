const fs = require('fs');
const sharp = require('sharp');

module.exports = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  fs.access("./images", (error) => {
    if (error) {
      fs.mkdirSync("./images");
    }
  });
  const { buffer } = req.file;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${timestamp}.webp`;
  await sharp(buffer)
    .webp({ quality: 20 })
    .resize(335, 540)
    .toFile("./images/" + fileName);

  const imageUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`;


  req.file.link = imageUrl;
  next();
};