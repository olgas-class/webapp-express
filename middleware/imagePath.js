const imagePath = (req, res, next) => {
  req.imagePath = `${req.protocol}://${req.get("host")}/images/books`;
  next();
};

export default imagePath;
