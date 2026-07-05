const Interview = require("../models/Interview");
const generateContent = require("../utils/gemini");

// ======================================
// CREATE INTERVIEW
// ======================================
const createInterview = async (req, res) => {
  try {
    const interview = await Interview.create(req.body);

    res.status(201).json({
      success: true,
      interviewId: interview._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// GENERATE QUESTIONS
// ======================================
const generateQuestions = async (req, res) => {
  try {
    const {
      role,
      company,
      experience,
      topic,
      difficulty,
      count,
      purpose,
    } = req.body;

    let prompt = "";

    if (purpose === "Learning") {
      prompt = `
Generate ${count} interview questions.

Role: ${role}
Company: ${company}
Experience: ${experience}
Topic: ${topic}
Difficulty: ${difficulty}

For EACH question also provide a detailed ideal answer.

Return ONLY valid JSON.

Example:

[
{
"question":"What is DBMS?",
"idealAnswer":"DBMS is software used to..."
},
{
"question":"Explain ACID properties.",
"idealAnswer":"ACID stands for..."
}
]
`;
    } else {
      prompt = `
Generate ${count} interview questions.

Role: ${role}
Company: ${company}
Experience: ${experience}
Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY the questions.
One question per line.
`;
    }

    const result = await generateContent(prompt);
    console.log(result);

    if (purpose === "Learning") {
      const match = result.match(/\[[\s\S]*\]/);
  console.log(match[0]);
      if (!match) {
        throw new Error("Invalid JSON from Gemini");
      }

      return res.json({
        success: true,
        learningData: JSON.parse(match[0]),
      });
    }

    const questions = result
      .split("\n")
      .map((q) => q.replace(/^\d+\.\s*/, "").trim())
      .filter((q) => q.length > 0);

    res.json({
      success: true,
      questions,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// SUBMIT INTERVIEW
// ======================================
const submitInterview = async (req, res) => {
  try {
    const { interviewId, questions, answers, duration } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const evaluatedAnswers = [];
    let totalScore = 0;

    for (let i = 0; i < questions.length; i++) {

      let score = 0;
      let feedback = "";
      let idealAnswer = "";

      const prompt = `
You are an expert technical interviewer.

Question:
${questions[i]}

Candidate Answer:
${answers[i] || "No Answer"}

Evaluate the answer.

Return ONLY valid JSON.

{
"score":8,
"feedback":"...",
"idealAnswer":"..."
}
`;

      try {

        const response = await generateContent(prompt);

        const match = response.match(/\{[\s\S]*\}/);

        if (!match) throw new Error("Invalid JSON");

        const result = JSON.parse(match[0]);

        score = Number(result.score) || 0;
        feedback = result.feedback || "";
        idealAnswer = result.idealAnswer || "";

      } catch {

        score = 0;
        feedback = "AI Evaluation Failed";
        idealAnswer = "";

      }

      totalScore += score;

      evaluatedAnswers.push({
        question: questions[i],
        answer: answers[i] || "",
        score,
        feedback,
        idealAnswer,
      });

    }

    // Save questions once
    interview.questions = questions;

    // Initialize attempts array if missing
    if (!interview.attempts) {
      interview.attempts = [];
    }

    // Create new attempt
    const newAttempt = {
  attemptNumber: interview.attempts.length + 1,
  totalScore,
  duration,
  answers: evaluatedAnswers,
  completedAt: new Date(),
};

    // Push attempt
   interview.attempts.push(newAttempt);

console.log("Before save:");
console.log(JSON.stringify(interview, null, 2));

await interview.save();

console.log("After save:");
console.log(JSON.stringify(interview, null, 2));

console.log("Returning attempt:");
console.log(newAttempt);

res.json({
    success: true,
    interview,
    attempt: newAttempt,
});

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
// ======================================
// GET INTERVIEW HISTORY
// ======================================
const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const interviews = await Interview.find({
  userId,
  "attempts.0": { $exists: true },
}).sort({
  createdAt: -1,
});

    res.json({
      success: true,
      interviews,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// GET IDEAL ANSWER (LEARNING MODE)
// ======================================
const getIdealAnswer = async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `
You are an expert software engineering interviewer.

Provide a detailed interview answer for the following question.

Question:
${question}

Requirements:
- Easy to understand
- 150-250 words
- Include important concepts
- Give interview-quality explanation

Return ONLY the answer.
`;

    const idealAnswer = await generateContent(prompt);

    res.json({
      success: true,
      idealAnswer,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const finishLearning = async (req, res) => {
  try {
    const { interviewId, answers } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const newAttempt = {
      attemptNumber: interview.attempts.length + 1,
      isLearning: true,
      totalScore: 0,
      answers,
      completedAt: new Date(),
    };

    interview.attempts.push(newAttempt);

    await interview.save();

    res.json({
      success: true,
      interview,
      attempt: newAttempt,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};//================================
// DELETE INTERVIEW
// ======================================
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findByIdAndDelete(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.json({
      success: true,
      message: "Interview deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createInterview,
  generateQuestions,
  submitInterview,
   getHistory,
  getIdealAnswer,
   deleteInterview,
   finishLearning
};