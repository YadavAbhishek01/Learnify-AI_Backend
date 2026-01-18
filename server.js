import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/Db.js';
import authRouter from './routes/auth/auth.js'
import documentrouter from './routes/pdf/pdf.js'
import aichatrouter from './routes/chat/aiChatRoutes.js'
import progressRoutes from './routes/progress/progress.routes.js'
// import { geminiModel } from './config/gemini.js';
dotenv.config();

const app = express();

app.use(express.json());

app.use(
    cors({
        origin:process.env.CLIENT_URL,
        credentials: true,
    })
);
// const result = await geminiModel.generateContent("who is prime minister of india");
// console.log(result.response.text());

app.get('/', (req, res) => {
    res.send('Server is running 🚀');
});
app.use('/api/auth',authRouter)
app.use("/api/pdf", documentrouter)
app.use("/api/ai", aichatrouter)
app.use("/api/progress", progressRoutes);
const port = process.env.PORT || 5000;

connectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


