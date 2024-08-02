const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};


    const storage = multer.memoryStorage();
    const upload = multer({storage: storage}).single('image');

    const saveImage = async (req, res, next) => {
        if (!req.file) {
            return next(); //continuer si file n'existe pas
        }
        const file = req.file;
        const name = req.file.originalname.split(' ').join('_').split('.')[0];
        const extension = MIME_TYPES[file.mimetype];

        if (!extension) {
            return res.status(400).json({ message: "Type de fichier n'est pas reconnu !" })
        }

        const filename = name + Date.now() + '.webp';
        const outputPath = path.join(__dirname, '../images', filename);

        try {
            await sharp(req.file.buffer)
                .webp({ quality:60 })
                .toFile(outputPath);

            req.file.path = outputPath;
            req.file.filename = filename;

            next();
        } catch (err) {
            res.status(500).json({ error: error.message })
        }

    }
module.exports = { upload, saveImage };

