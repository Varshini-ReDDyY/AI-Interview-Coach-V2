const pdfParse = require("pdf-parse");

const extractPdfText = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

module.exports = extractPdfText;
