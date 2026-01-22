import multer from "multer";

const storage = multer.diskStorage({
  destination: "public/images/",
  filename: (req, file, callbackFun) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    callbackFun(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
