const multer = require('multer');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }

    return cb(new Error('Apenas arquivos de imagem sao permitidos'));
};

const uploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
});

const handleUploadError = (err, res) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Arquivo excede o limite de 5MB' });
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: `Quantidade maxima de arquivos: ${MAX_FILES}` });
        }

        return res.status(400).json({ message: `Erro de upload: ${err.code}` });
    }

    return res.status(400).json({ message: err.message || 'Erro no upload de imagem' });
};

const singleImageUpload = (fieldName = 'image') => {
    return (req, res, next) => {
        uploader.single(fieldName)(req, res, (err) => {
            if (err) {
                return handleUploadError(err, res);
            }

            return next();
        });
    };
};

const multipleImagesUpload = (fieldName = 'images', maxCount = MAX_FILES) => {
    return (req, res, next) => {
        uploader.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                return handleUploadError(err, res);
            }

            return next();
        });
    };
};

module.exports = {
    singleImageUpload,
    multipleImagesUpload,
    MAX_FILE_SIZE,
    MAX_FILES
};
