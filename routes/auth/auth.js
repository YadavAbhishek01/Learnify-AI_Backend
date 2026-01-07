import express from 'express'
import { checkAuth, loginUser, registerUser, UpdateProfile } from '../../controllers/user/user.controller.js';
import {  Authmiddelware } from '../../middelwares/auth/auth.middelwares.js';
import { upload } from '../../multer/multer.js';

const router=express.Router();
router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/check',Authmiddelware,checkAuth)
router.put('/update',Authmiddelware,upload.single('file'),UpdateProfile)

export default router