import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: Number,
  publicId: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  extractedText:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Pdf = mongoose.model("Pdf", pdfSchema);
