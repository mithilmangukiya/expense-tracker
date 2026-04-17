const express = require('express');
const {protect} = require('../middleware/authMiddleware');

const {registerUser, loginUser, getUserInfo, updateCurrency} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', protect, getUserInfo);
router.put('/currency', protect, updateCurrency);
router.post('/upload-image', upload.single('image'), (req, res) => {
    if(!req.file){
        return res.status(400).json({msg: 'No file uploaded'});
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads${req.file.filename}`;
    res.status(200).json({imageUrl});
})

module.exports = router;