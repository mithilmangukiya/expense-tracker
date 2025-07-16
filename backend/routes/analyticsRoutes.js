const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const { analytics, monthly_comparison, yearly_trends, weekly_trends } = require('../controllers/analytics');

const router = express.Router();

router.post('/', protect, analytics)
router.post('/monthly', protect, monthly_comparison)
router.post('/yearly', protect, yearly_trends)
router.get('/weekly', protect, weekly_trends)

module.exports = router;