const express = require('express')
//Authentication 
const requireAuth = require('../middleware/requireAuth');
// controller functions
const { addCompanyOrg} = require('../controllers/companyOrgController');

const router = express.Router()

// require auth for all routes
router.use(requireAuth)

// addCompanyOrg route
router.post('/add', addCompanyOrg);

module.exports = router;