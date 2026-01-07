import express from 'express'
import { Deletepdf, getPdfByUser, uploadPdf } from '../../controllers/pdf/pdf.controller.js';
import { Authmiddelware } from '../../middelwares/auth/auth.middelwares.js';
import { upload } from '../../multer/multer.js';
import { ExplainConcept, generateFlashcard, generateQuize, getFlashCardById, getPdfSummary } from '../../controllers/aiChat.controller/aiChatController.js';


const router=express.Router();
router.post('/upload',Authmiddelware,upload.single("file"),uploadPdf)
router.get('/my-pdfs',Authmiddelware,getPdfByUser)
router.delete('/delete/:pdfId',Authmiddelware,Deletepdf)

router.get("/summary/:pdfId", Authmiddelware, getPdfSummary);
router.get("/flashcards/:pdfId", Authmiddelware, generateFlashcard);
router.get("/get-flashcards/:pdfId", Authmiddelware, getFlashCardById);
router.get("/quiz/:pdfId", Authmiddelware, generateQuize);
router.get("/explain/:pdfId", Authmiddelware, ExplainConcept);
export default router   