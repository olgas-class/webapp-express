import express from "express";
import connection from "./db.js";

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
