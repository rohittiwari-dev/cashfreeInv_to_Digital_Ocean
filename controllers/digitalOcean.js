const fs = require("fs");
const utils = require("util");
const path = require("path");
const { uploadInv, getFileStream } = require("../s3");

const unlinkFile = utils.promisify(fs.unlink);

const uploadKey = async (req, res) => {
  const id = req.params.key;
  const readStream = await getFileStream(id);
  console.log(readStream);
  res.send(`<a href=${readStream}>${readStream}</a>`);
};

const uploads = async (req, res) => {
  const file = req.file;
  console.log(file);
  const result = await uploadInv(file);
  console.log(result);
  await unlinkFile(file.path);
  res.send(`http://localhost:4000/download/${result.Key}`);
};

const downloadKey = async (req, res) => {
  const id = req.params.key;
  const readStream = await getFileStream(id);
  console.log(readStream);
  res.redirect(readStream);
};

module.exports = {
  uploadKey,
  uploads,
  downloadKey,
};
