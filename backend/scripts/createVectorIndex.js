require("dotenv").config();
const mongoose = require("mongoose");

const INDEX_NAME = "resume_vector_index";

const INDEX_DEFINITION = {
  fields: [
    {
      type: "vector",
      path: "embedding",
      numDimensions: 3072,
      similarity: "cosine",
    },
    {
      type: "filter",
      path: "interviewId",
    },
  ],
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.db;

  const collections = await db
    .listCollections({ name: "resumechunks" })
    .toArray();

  if (collections.length === 0) {
    await db.createCollection("resumechunks");
  }

  try {
    await db.collection("resumechunks").dropSearchIndex(INDEX_NAME);
    console.log(`Dropped existing '${INDEX_NAME}' index, recreating...`);
  } catch (err) {
    // no existing index to drop, continue
  }

  await db.collection("resumechunks").createSearchIndex({
    name: INDEX_NAME,
    type: "vectorSearch",
    definition: INDEX_DEFINITION,
  });

  console.log(
    `Vector search index '${INDEX_NAME}' creation requested. It can take a minute to finish building in Atlas.`
  );

  process.exit(0);
};

run().catch((err) => {
  console.error(err.message);
  console.error(
    "If this fails, create the index manually in the Atlas dashboard (Database > your cluster > Search > Create Search Index > JSON Editor), on the 'resumechunks' collection, using this definition:\n" +
      JSON.stringify(INDEX_DEFINITION, null, 2)
  );
  process.exit(1);
});
