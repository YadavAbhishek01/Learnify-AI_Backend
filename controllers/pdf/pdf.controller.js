import cloudinary from "../../config/cloudinary.js";
import { Pdf } from "../../models/pdf/Pdf.js";
import streamifier from "streamifier";
import  extractPkg  from "../../utils/extractPdfText.cjs";
const { extractPdfText } = extractPkg;
export const uploadPdf=async(req,res)=>{
    try {
        const userId=req.user._id;
        console.log(userId)
        if(!req.file)
        {
              return res.status(400).json({ message: "No file uploaded" });
        }

           if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }
        const uploadFile=await new Promise((resolve,reject)=>{
         const stream = cloudinary.uploader.upload_stream(
            {folder:"Pdf",
            resource_type:"raw",  // raw upload preserves PDF
            format:"pdf"
            }
            ,(error,result)=>{
                if(error)
                {
                   return reject(error)
                }
                else{
                    resolve(result);
                }
            })
            
      // Pipe the buffer into the Cloudinary stream
            streamifier.createReadStream(req.file.buffer).pipe(stream)
        })
      const pdfText = await extractPdfText(req.file.buffer);
    console.log(pdfText.slice(0, 300));
console.log("PDF TEXT LENGTH:", pdfText.length);

        const newPdf=await Pdf.create({
            originalName: req.file.originalname,
         fileUrl: uploadFile.secure_url,
         fileSize: req.file.size,
         publicId: uploadFile.public_id,
         uploadedBy: userId, // if auth middleware exists
         extractedText:pdfText
        })
          return res.status(201).json({
            success:true,
      message: "PDF uploaded successfully",
      pdf: newPdf
    });

    } catch (error) {
    console.error("PDF upload error:", error);
    return res.status(500).json({success:false, message: "Server error" });
    }
}
export const getPdfByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const pdfs = await Pdf.find({ uploadedBy: userId }).populate("uploadedBy","name profile_pic");

    if (!pdfs || pdfs.length === 0) {
      return res.status(404).json({
        message: "No PDFs found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "PDFs fetched successfully",
      success: true,
      pdfs,
    });
  } catch (error) {
    console.error("Get PDF error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
export const Deletepdf = async (req, res) => {
  try {
    const pdfId = req.params.pdfId;
    const userId = req.user._id;

    // 1. Find PDF
    const pdf = await Pdf.findById(pdfId);

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    // 2. Ownership check (NO semicolon!)
    if (pdf.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this PDF",
      });
    }

    // 3. Delete from Cloudinary
    await cloudinary.uploader.destroy(pdf.publicId, {
      resource_type: "raw",
      format:"pdf"
    });

    // 4. Delete from MongoDB
    await pdf.deleteOne();

    return res.status(200).json({
      success: true,
      message: "PDF deleted successfully",
    });

  } catch (error) {
    console.error("Delete PDF error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

