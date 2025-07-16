const express = require('express');
const {protect} = require('../middleware/authMiddleware')
const {getDashboardData, handleChatbotQuery, generateInsights, compare} =  require('../controllers/dashboardController')

const router = express.Router();

router.get('/', protect, getDashboardData);
router.post('/chatbot', protect, handleChatbotQuery);
router.get("/insights", protect, generateInsights);
router.post('/compare', protect, compare)


module.exports = router;