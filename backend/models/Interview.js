const mongoose = require("mongoose");

// =====================================
// Answer Schema
// =====================================
const answerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },

  answer: {
    type: String,
    default: "",
  },

  idealAnswer: {
    type: String,
    default: "",
  },

  feedback: {
    type: String,
    default: "",
  },

  score: {
    type: Number,
    default: 0,
  },
});

// =====================================
// Attempt Schema
// =====================================
const attemptSchema = new mongoose.Schema({
  attemptNumber: {
    type: Number,
    required: true,
  },

  totalScore: {
    type: Number,
    default: 0,
  },
   isLearning: {
  type: Boolean,
  default: false,
},
  duration: {
    type: Number,
    default: 0,
  },

  answers: [answerSchema],

  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// =====================================
// Interview Schema
// =====================================
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    topic: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      default: "",
    },

    purpose: {
      type: String,
      enum: ["Interview", "Learning"],
      default: "Interview",
    },

    questions: {
      type: [String],
      default: [],
    },

    // All interview attempts
    attempts: {
      type: [attemptSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);