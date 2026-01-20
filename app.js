import express from "express";
import booksRouter from "./routers/books.js";
import handleError from "./middlewares/handleError.js";
import cors from "cors";

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.static("public"));

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use("/api/books", booksRouter);

app.use(handleError);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
