import multer from "multer";

// File RAM me store hogi (temporary)
const storage = multer.memoryStorage();

// Sirf PDF allow
const fileFilter = (req, file, cb) => {
 if(file.mimetype.startsWith('image/'))
 {
   cb(null,true)
 }
 else if (file.mimetype === "application/pdf") {
    cb(null, true);
  }
   else {
    cb(
      new Error("Only image files and PDF files are allowed"),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});


