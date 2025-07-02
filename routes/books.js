import express from "express";
import booksController from "../controllers/booksController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", booksController.index);
router.get("/:slug", booksController.show);
router.post("/", upload.single("image"), booksController.store);
router.delete("/:slug", booksController.destroy);

router.post("/:id/reviews", booksController.storeReview);

export default router;
