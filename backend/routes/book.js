const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp');
router.post('/', auth, multer, sharp, bookController.createBook);
router.get('/', bookController.getAllBook);
router.get('/bestrating', bookController.bestRating);
router.get('/:id', bookController.getOneBook);
router.put('/:id', auth, multer, sharp, bookController.modifyBook);
router.delete('/:id', auth, bookController.deleteBook);
router.post('/:id/rating', auth, bookController.rating);

module.exports = router;