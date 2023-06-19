import path from 'path';
import multer from 'multer';
import { v4 as uuidV4 } from 'uuid';
import HttpErrors from 'http-errors';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(path.resolve(), 'public')),
  filename: (req, file, cb) => cb(null, `${uuidV4()}_${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    const arr = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
    if (!arr.includes(file.mimetype)) {
      callback(HttpErrors(422, {
        errors: {
          images: ['images error'],
        },
      }), true);
    } else {
      callback(null, true);
    }
  },
});

export default upload;
