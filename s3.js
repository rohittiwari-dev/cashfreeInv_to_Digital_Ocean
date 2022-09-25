const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();

const endpoint = process.env.DO_SPACES_ENDPOINT;
const spaceid = process.env.DO_SPACES_KEY;
const spacekey = process.env.DO_SPACES_SECRET;
const spacename = process.env.DO_SPACES_NAME;

const s3Client = new S3({
  endpoint: endpoint,
  credentials: {
    accessKeyId: spaceid,
    secretAccessKey: spacekey,
  },
});

function uploadInv(file) {
  const fileStream = fs.createReadStream(file.path);

  const s3Params = {
    Bucket: spacename,
    Body: fileStream,
    Key: file.filename,
  };

  return s3Client.upload(s3Params).promise();
}
exports.uploadInv = uploadInv;

function getFileStream(fileKey) {
  const downloadParam = {
    Bucket: spacename,
    Key: fileKey,
  };
  const url = s3Client.getSignedUrlPromise("getObject", downloadParam);
  return url;
}
exports.getFileStream = getFileStream;
