const express = require('express');

// controller functions
const {  signupUser, loginUser, generateQrcode, validate ,forgotPassword, passwordreset, companyApproval} = require('../controllers/adminController');

const router = express.Router()

// login route
router.post('/login', loginUser);

// signup route
router.post('/signup', signupUser);

// verify company
router.get('/companyApproval/:token', companyApproval);

router.get('/qrcode', generateQrcode);

router.post('/validate', validate);

router.post('/forgotpassword', forgotPassword);

router.post('/restpassword', passwordreset)

module.exports = router;