import express from 'express';
import { askPdfQuestion, getChatByPdf } from '../../controllers/aiChat.controller/aiChatController.js';
import {  Authmiddelware } from '../../middelwares/auth/auth.middelwares.js';

const router=express.Router();

router.post('/ask/:pdfId',Authmiddelware,askPdfQuestion)

router.get("/chat/:pdfId", Authmiddelware, getChatByPdf);

export default router       