const express = require('express');
const { generatePdf} = require('../controllers/payment_controller');

const router = express.Router();

router.route('/download').get(generatePdf);


module.exports ={
    routes: router
};