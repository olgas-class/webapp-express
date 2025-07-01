import express from "express";
import booksController from "../controllers/booksController.js";

const router = express.Router();

router.get("/", booksController.index);
router.get("/:slug", booksController.show);
router.post("/", booksController.store);

router.post("/:id/reviews", booksController.storeReview);

export default router;
