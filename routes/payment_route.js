const express = require('express');

const router = express.Router();

const {request,response} = require('../controllers/payment_controller');

router.route('/payment/cashfree/request').get(request);
router.route('/payment/cashfree/response').post(response);


module.exports = router;