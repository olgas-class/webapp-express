import express from "express";
import bookController from "../controller/bookController.js";

const router = express.Router();

router.get("/", bookController.index);
router.get("/search", bookController.search);
router.get("/:slug", bookController.show);
export default router;
