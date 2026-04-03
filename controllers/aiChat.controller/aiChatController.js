import { Pdf } from "../../models/pdf/Pdf.js";
import { geminiModel } from "../../config/gemini.js";
import { Chat } from "../../models/chat/Chat.js";
import { FlashCard } from "../../models/flashcard/FlashCard.model.js";

export const askPdfQuestion =async(req,res)=>{
    try {
        const {pdfId}=req.params
        const {question}=req.body;
        const userId=req.user._id

        
        if(!pdfId || !question)
        {
            return res.status(400).json({ message: "Question and PDF ID required" });
        }
        const pdf=await Pdf.findById(pdfId).populate("uploadedBy","name email");
        if(!pdf)
        {
            return res.status(404).json({ message: "PDF not found" });
        }

      const prompt = `
You are an AI study assistant.

RULES (STRICT):
- The answer language MUST match the document language.
- Ignore the language of the user's question.
- Do NOT mix languages.
- Use technical terms exactly as written in the document.
- Do NOT translate proper nouns (React, JavaScript, JSX, DOM).
- If the answer is not present in the document, say:
  "Not found in document"

DOCUMENT LANGUAGE:
Detect automatically from the document text.

DOCUMENT CONTENT:
${pdf.extractedText}

QUESTION:
${question}
`;


        if(pdfId && question)
        {
        const result= await geminiModel.generateContent(prompt);
        const response=result.response.text();

        let chat=await Chat.findOne({pdfId,userId});
        
     if (!chat) {
      chat = await Chat.create({
        pdfId,
        userId,
        messages: []
      });
    }

  chat.messages.push(
  { role: "user", content: question },
  { role: "ai", content: response } // ✅ correct
);


    await chat.save();
    return res.status(200).json({
     success:true,
      question,
      answer: response
    });
        }

       
    } catch (error) {
          console.error("AI Chat Error:", error);
    return res.status(500).json({ message: "AI chat failed" });
    }
}

export const getChatByPdf = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({ pdfId, userId });

    res.status(200).json({
      success: true,
      messages: chat?.messages || []
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat" });
  }
};

export const getPdfSummary =async(req,res)=>{
  const pdfId=req.params.pdfId;

  const pdf=await Pdf.findById(pdfId);
   if (!pdf) return res.status(404).json({success:false, message: "PDF not found" });

   const prompt=`Summarize the following document in  base on document language.
Give bullet points and headings.
You are an AI study assistant.
RULES (STRICT):
- The answer language MUST match the document language.
- Ignore the language of the user's question.
- Do NOT mix languages.
- Use technical terms exactly as written in the document.
- Do NOT translate proper nouns (React, JavaScript, JSX, DOM).
- If the answer is not present in the document, say:
  "Not found in document"

DOCUMENT LANGUAGE:
Detect automatically from the document text.

DOCUMENT:
${pdf.extractedText};`
    const result=await geminiModel.generateContent(prompt);
    return res.status(200).json({
      success:true,
      summary:result.response.text()
    })
} 
export const generateFlashcard = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const userId = req.user._id;

    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }
    //   const count = await FlashCard.countDocuments({ userId });
    // if (count >= 5) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You can generate only 5 flashcard decks",
    //   });
    // }
    const prompt = `
You are an AI teacher.

TASK:
Create EXACTLY 10 flashcards from the document.

RULES (STRICT):
- Each question MUST be UNIQUE
- Cover DIFFERENT concepts
- Do NOT repeat ideas
- Short, clear student-friendly answers
- Return ONLY valid JSON
- No markdown, no explanation

FORMAT:
{
  "flashcards": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}

DOCUMENT:
${pdf.extractedText.slice(0, 6000)}
`;

    const result = await geminiModel.generateContent(prompt);

     let text = result.response.text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);

    if (!parsed.flashcards || parsed.flashcards.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "AI did not return 10 flashcards"
      });
    }

    const deck = await FlashCard.create({
      userId,
      pdfId,
      content: parsed.flashcards.map((c, i) => ({
        question: c.question,
        answer: c.answer,
        order: i + 1
      }))
    });

    return res.status(200).json({
      success: true,
      flashcard: deck
    });
  } catch (error) {
    console.error("Generate Flashcard Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getFlashCardById=async(req,res)=>{
  try {
        const {pdfId}=req.params;
        const userId=req.user._id;

        const flashcard=await FlashCard.find({userId,pdfId}).sort({ createdAt: 1 });

        if (flashcard.length === 0)
        {
          return res.status(400).json({
            message:"Flashcard not found",
            success:false,
          })
        }
        return res.status(200).json({
          message:"flashcard found",
          success:true,
          flashcard:flashcard
        })
  } catch (error) {
    console.error(" Flashcard fetch Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
export const generateQuize=async(req,res)=>{
 try {
   const pdfId=req.params.pdfId;
   const pdf=await Pdf.findById(pdfId);
   if (!pdf) return res.status(404).json({success:false, message: "PDF not found" });

const prompt = `
You are an AI teacher.

TASK:
Create EXACTLY 5 MCQ questions from the document.

RULES:
- Each question must be unique
- 4 options per question
- Only ONE correct answer
- The correctAnswer MUST be EXACTLY one of the options (full text, not A/B/C/D)
- Do NOT return A, B, C, D as answers
- Return ONLY valid JSON
- No explanation

FORMAT:
[
  {
    "question": "Question here",
    "options": [
      "Option 1 full text",
      "Option 2 full text",
      "Option 3 full text",
      "Option 4 full text"
    ],
    "correctAnswer": "Exact matching option text"
  }
]

DOCUMENT:
${pdf.extractedText.slice(0, 6000)}
`;

  const result=await geminiModel.generateContent(prompt);
  let text=result.response.text().replace(/```json/g,"").replace(/```/g,"").trim();

  const quiz=JSON.parse(text);

  if(!Array.isArray(quiz) || quiz.length !==5)
  {
     return res.status(400).json({
        success: false,
        message: "AI did not return 5 questions"
      });
  }
  return res.status(200).json({
    success:true,
    message:"Quiz Generated",
    data:quiz
  })
 } catch (error) {
   console.error("Quiz Generate Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Quiz generation failed"
    });
 }
}
export const ExplainConcept = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { concept } = req.query;
    const userId = req.user._id;

    // ✅ Validation
    if (!concept) {
      return res.status(400).json({
        success: false,
        message: "Concept query is required",
      });
    }

    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    const prompt = `
You are an AI study assistant.

TASK:
Explain the given concept ONLY using the provided document content.

RULES (STRICT):
- Answer ONLY from the document.
- If the concept is NOT found in the document, reply exactly:
  "Not found in document"
- Use the SAME language as the document.
- Do NOT add outside knowledge.
- Explain in simple, student-friendly language.
- Use headings and bullet points if available.

DOCUMENT CONTENT:
${pdf.extractedText}

CONCEPT TO EXPLAIN:
${concept}
`;

    const result = await geminiModel.generateContent(prompt);
    const explanation = result.response.text();

    // ✅ Optional: Progress update (Concept viewed)
    // await Progress.findOneAndUpdate(
    //   { userId, pdfId },
    //   { summaryRead: true },
    //   { upsert: true }
    // );

    return res.status(200).json({
      success: true,
      concept,
      explanation,
    });
  } catch (error) {
    console.error("Explain Concept Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to explain concept",
    });
  }
};

export const DeleteFlashCard=async (req,res)=>{

 try {
   const userId=req.user._id;
  const flashcardId=req.body;

  const Flashcards=await FlashCard.findOneAndDelete({userId:userId,_id:flashcardId});

    if (!Flashcards) {
      return res.status(404).json({
        success: false,
        message: "FlashCard Not Found or You are not unauthorized to Deleted this ",
      });
    }
  return res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully",
    });
 } catch (error) {
  console.error("Delete Flashcard Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
 }
}

export const getFlashcards=async(req,res)=>{
  try {
    const userId=req.user._id;

    if(!userId)
    {
         return res.status(400).json({
        message:"user not found",
        success:flase,
      })
    }
    const flashcard=await FlashCard.find({userId});
    if(!flashcard)
    {
      return res.status(404).json({
        message: "Flashcards not found",
        success: false,
        data:[]
      });
   
    }
       return res.status(200).json({
        message:"Flashcard found",
        success:true,
        data:flashcard,
        count:flashcard.length
      })
  } catch (error) {
     console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}