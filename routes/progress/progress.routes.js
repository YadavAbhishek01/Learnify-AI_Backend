import express from "express";
import { Authmiddelware } from "../../middelwares/auth/auth.middelwares.js";
import { getUserProgress } from "../../controllers/Progress/Progrees.controller.js";
import { submitQuiz } from "../../controllers/Quize/Quize.controller.js";


const router = express.Router();

router.post("/quiz/:pdfId", Authmiddelware, submitQuiz);
router.get("/", Authmiddelware, getUserProgress);

export default router;
