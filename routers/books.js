import express from "express";
import bookController from "../controller/bookController.js";

const router = express.Router();

router.get("/", bookController.index);
router.get("/search", bookController.search);
router.get("/:slug", bookController.show);

// Possiamo usare slug oppure IdleDeadline, perché non è la visualizzazione, ma l'operazione di salvataggio
router.post("/:id/reviews", bookController.storeReview);
export default router;
