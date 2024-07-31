const express = require('express');
const auth = require('../middleware/auth');
const { upload, saveImage } = require('../middleware/multer-config');
const router = express.Router();


const bookCtrl = require('../controllers/book_ctrl');


router.get('/bestrating', bookCtrl.getTopBooks);
router.post('/', auth, upload, saveImage, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.creatRatingBook);
router.put('/:id', auth, upload, saveImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/', bookCtrl.getAllBooks);





module.exports = router;