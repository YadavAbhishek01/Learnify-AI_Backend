import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pdf",
      required: true
    },
    quizScore: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const Progress = mongoose.model("Progress", ProgressSchema);
