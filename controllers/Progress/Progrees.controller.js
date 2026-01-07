import { Progress } from "../../models/progressbar/ProgressSchema.js";

export const getUserProgress = async (req, res) => {
  const userId = req.user._id;

  const progress = await Progress.find({ userId })
    .populate("pdfId", "originalName");

  res.json(progress);
};
