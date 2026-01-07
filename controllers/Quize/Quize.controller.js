import { Progress } from "../../models/progressbar/ProgressSchema.js";

export const submitQuiz = async (req, res) => {
  try {
    const pdfId=req.params.pdfId;
   const { score } = req.body;
  const userId = req.user._id;

  const progress = await Progress.findOneAndUpdate(
    { userId, pdfId },
    { quizScore: score },
    { new: true, upsert: true }
  );

  res.status(200).json({
      success: true,
      data:progress
    });
  } catch (error) {
       res.status(500).json({
      success: false,
      message: "Quiz submit failed"
    });
  }
};
