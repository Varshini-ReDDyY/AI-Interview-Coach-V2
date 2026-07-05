import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";

function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    interviewId,
    questions = [],
    form,
  } = location.state || {};

  const isLearningMode = form?.purpose === "Learning";

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState(
    Array(questions.length).fill("")
  );
  

const [startTime] = useState(Date.now());



  const [idealAnswer, setIdealAnswer] = useState("");
  const [idealAnswers, setIdealAnswers] = useState(
  Array(questions.length).fill("")
);

  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // =============================
  // Safety
  // =============================
  if (!interviewId || questions.length === 0) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 30 }}>
          <h2>No Interview Found</h2>
        </div>
      </>
    );
  }

  // =============================
  // Interview Mode
  // =============================
  const handleAnswerChange = (e) => {
    const updated = [...answers];
    updated[currentQuestion] = e.target.value;
    setAnswers(updated);
  };

  // =============================
  // Learning Mode
  // =============================
  const showIdealAnswer = async () => {
    try {
      setLoadingAnswer(true);

      const res = await axios.post(
        "http://localhost:5000/api/interview/ideal-answer",
        {
          question: questions[currentQuestion],
        }
      );

     setIdealAnswer(res.data.idealAnswer);

const updated = [...idealAnswers];
updated[currentQuestion] = res.data.idealAnswer;
setIdealAnswers(updated);

    } catch (err) {
      console.log(err);
      alert("Unable to fetch answer");
    } finally {
      setLoadingAnswer(false);
    }
  };

  // =============================
  // Next
  // =============================
  const nextQuestion = () => {

    setIdealAnswer("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // =============================
  // Previous
  // =============================
  const previousQuestion = () => {

    setIdealAnswer("");

    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // =============================
  // Submit Interview
  // =============================
  const submitInterview = async () => {
    try {
      
      const duration = Math.floor(
  (Date.now() - startTime) / 1000
);
      const res = await axios.post(
        "http://localhost:5000/api/interview/submit",
        {
          interviewId,
          questions,
          answers,
          
    duration,
        }
      );
    console.log("FULL RESPONSE:", res.data);


      navigate("/report", {
  state: {
    interview: res.data.interview,
    attempt: res.data.attempt,
  },
});

    } catch (err) {
      console.log(err);
      alert("Error submitting interview");
    }
  };

 const finishLearning = async () => {
  try {
    const learningAnswers = questions.map((question, index) => ({
      question,
      idealAnswer: idealAnswers[index],
    }));

    const res = await axios.post(
      "http://localhost:5000/api/interview/finish-learning",
      {
        interviewId,
        answers: learningAnswers,
      }
    );

    navigate("/report", {
      state: {
        interview: res.data.interview,
        attempt: res.data.attempt,
      },
    });

  } catch (err) {
    console.log(err);
    alert("Unable to save learning session");
  }
};
  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          background: "#b6f3f7",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,.1)",
        }}
      >
        <h2>
          Question {currentQuestion + 1} / {questions.length}
        </h2>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background:"#eff6ff",
            borderLeft:"6px solid #2563eb",
            borderRadius: 8,
            fontSize: 18,
          }}
        >
          {questions[currentQuestion]}
        </div>

        {/* ===========================
            INTERVIEW MODE
        =========================== */}

        {!isLearningMode && (
          <textarea
            placeholder="Write your answer..."
            value={answers[currentQuestion]}
            onChange={handleAnswerChange}
            style={{
              width: "100%",
              height: 180,
              marginTop: 20,
              padding: 10,
              fontSize: 16,
            }}
          />
        )}

        {/* ===========================
            LEARNING MODE
        =========================== */}

        {isLearningMode && (

          <div style={{ marginTop: 20 }}>

            <button className="btn btn-teal" onClick={showIdealAnswer}>
              Show Ideal Answer
            </button>

            {loadingAnswer && (
              <p style={{ marginTop: 20 }}>
               🤖 AI is generating Answer...
              </p>
            )}

            {idealAnswer && (

              <div
                style={{
                  marginTop: 20,
                  background: "#eef7ff",
                  padding: 20,
                  borderRadius: 8,
                }}
              >

                <h3>Ideal Answer</h3>

                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                  }}
                >
                  {idealAnswer}
                </p>

              </div>

            )}

          </div>

        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 25,
          }}
        >
          <button
          className="btn btn-orange"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (

            isLearningMode ? (

              <button 
              className="btn btn-gradient"
              onClick={finishLearning}>
  Finish Learning
</button>

            ) : (

           <button
  onClick={submitInterview}
className="btn btn-green"
>
  Submit Interview
</button>

            )

          ) : (

            <button onClick={nextQuestion} className="btn btn-teal">
              Next
            </button>

          )}
        </div>
      </div>
    </>
  );
}

export default Interview;