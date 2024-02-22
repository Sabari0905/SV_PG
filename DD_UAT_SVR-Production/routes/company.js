const express = require('express');

// Authentication
const requireAuth = require('../middleware/requireAuth');

// Controller Function
const { addCompany, getCompany, updateCompany } = require('../controllers/companyController');

const router = express.Router();

// Require auth for all routes
router.use(requireAuth);

// Company route
router.post('/add', addCompany);
router.get('/get', getCompany);
router.put('/update/:companyId', updateCompany);


module.exports = router;
