const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001",
});

// ===============================
// EMBED A SINGLE QUERY
// ===============================
const embedText = async (text) => {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
};

// ===============================
// EMBED MANY CHUNKS
// (gemini-embedding-001 doesn't support batchEmbedContents)
// ===============================
const embedTexts = async (texts) => {
  return Promise.all(texts.map((text) => embedText(text)));
};

module.exports = { embedText, embedTexts };
