const errorHandler = (err, req, res, next) => {
  console.log(err);

  const resData = {
    status: "fail",
    message: "Qualcosa è andato storto",
  };

  if (process.env.ENVIRONMENT === "development") {
    resData.error = err.message;
  }

  return res.status(500).json(resData);
};

export default errorHandler;
