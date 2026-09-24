import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// Allow only jpg and png
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// Safe upload error handler
export const handleUploadError = (err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err?.message === "Only JPG and PNG files are allowed"
  ) {
    return res.status(400).json({
      message: "Invalid image file. Only JPG and PNG files are allowed.",
    });
  }

  next(err);
};

export default upload;