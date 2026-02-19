const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = (fileBuffer, folder = 'portfolio/projects') => {
    if (!fileBuffer) {
        throw new Error('File buffer is required for upload');
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return reject(new Error('Cloudinary upload failed'));
                }

                return resolve({
                    imageUrl: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};

const deleteImage = (publicId) => {
    return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

module.exports = {
    uploadImage,
    deleteImage
};
