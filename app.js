import express from "express";
import booksRouter from "./routes/books.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorsHandler.js";
import imagePath from "./middleware/imagePath.js";
import cors from "cors";

const app = express();
const port = process.env.SERVER_PORT;

app.use(
  cors({
    origin: process.env.FE_URL,
  })
);

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({
    data: "Welcome to Books API",
  });
});

app.use("/books", imagePath, booksRouter);

app.use(notFound);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
