// utils/extractPdfText.cjs
const { PDFParse } = require("pdf-parse");

module.exports.extractPdfText = async (buffer) => {
  const parser = new PDFParse(
    {
      data: buffer,
    },
    {
      // 🚫 DISABLE WORKER (VERY IMPORTANT)
      useWorker: false,
    }
  );

  const result = await parser.getText();

  await parser.destroy();

  return result.text;
};
