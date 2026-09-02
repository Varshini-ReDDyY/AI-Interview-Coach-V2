const chunkText = (text, chunkSize = 1000, overlap = 150) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const chunks = [];

  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    chunks.push(cleaned.slice(start, end).trim());

    if (end === cleaned.length) break;
    start = end - overlap;
  }

  return chunks.filter((chunk) => chunk.length > 0);
};

module.exports = chunkText;
