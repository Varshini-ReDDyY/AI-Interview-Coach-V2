import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Report() {
  const location = useLocation();
  const navigate = useNavigate();

  console.log("LOCATION OBJECT:", location);
  console.log("LOCATION STATE:", location.state);

  
 
const { interview, attempt } = location.state || {};
  if (!interview || !attempt) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "30px" }}>
          <h2>No Report Found</h2>
        </div>
      </>
    );
  }
   const isLearning = interview.purpose === "Learning";
  const retakeSameQuestions = async () => {
  try {
    const userId = localStorage.getItem("userId");

    const res = await axios.post(
      "http://localhost:5000/api/interview/create",
      {
        userId,
        role: interview.role,
        company: interview.company,
        experience: interview.experience,
        topic: interview.topic,
        difficulty: interview.difficulty,
        purpose: interview.purpose,
      }
    );

    navigate("/interview", {
      state: {
        interviewId: res.data.interviewId,
        questions: interview.questions,
        form: {
          purpose: interview.purpose,
        },
      },
    });
  } catch (err) {
    console.log(err);
    alert("Unable to retake interview");
  }
};
const retakeNewQuestions = async () => {
  try {
    const userId = localStorage.getItem("userId");

    // Create a new interview
    const createRes = await axios.post(
      "http://localhost:5000/api/interview/create",
      {
        userId,
        role: interview.role,
        company: interview.company,
        experience: interview.experience,
        topic: interview.topic,
        difficulty: interview.difficulty,
        purpose: interview.purpose,
      }
    );

    // Generate fresh questions
    const genRes = await axios.post(
      "http://localhost:5000/api/interview/generate",
      {
        role: interview.role,
        company: interview.company,
        experience: interview.experience,
        topic: interview.topic,
        difficulty: interview.difficulty,
        purpose: interview.purpose,
        count: interview.questions.length,
      }
    );

    navigate("/interview", {
      state: {
        interviewId: createRes.data.interviewId,
        questions: genRes.data.questions,
        form: {
          purpose: interview.purpose,
        },
      },
    });
  } catch (err) {
    console.log(err);
    alert("Unable to generate new interview");
  }
};
const chartData = attempt.answers.map((item, index) => ({
  question: `Q${index + 1}`,
  score: item.score,
}));
const percentage =
(attempt.totalScore/(attempt.answers.length*10))*100;
  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          background: "#c9eefb",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,.1)",
        }}
      >

        <h1
style={{
textAlign:"center",
fontSize:40,
color:"#1e3a8a"
}}
>
{
isLearning
?
"📖 Learning Report"
:
"📄 AI Interview Evaluation"
}
</h1>
        {!isLearning && (
        <div className="card">
 
  <div className="report-grid">

    <div>
      <h4>💼 Role</h4>
      <p>{interview.role}</p>
    </div>

    <div>
      <h4>🏢 Company</h4>
      <p>{interview.company}</p>
    </div>

    <div>
      <h4>📚 Topic</h4>
      <p>{interview.topic}</p>
    </div>

    <div>
      <h4>🎯 Difficulty</h4>
      <p>{interview.difficulty}</p>
    </div>

  </div>
</div>
)}
        <hr />

      {
isLearning
?
<h2>📖 Learning Session Completed</h2>
:
<h2>Attempt #{attempt.attemptNumber}</h2>
}
{!isLearning && (
       <div
className="card"
style={{
textAlign:"center",
background:"#eff6ff"
}}
>

<h3>Your Performance</h3>

<h1
style={{
fontSize:60,
color:"#16a34a"
}}
>
⭐ {attempt.totalScore}
</h1>

<p>
Out of {attempt.answers.length*10}
</p>

<h2>

{
percentage>=80 ?

"🏆 Excellent"

:

percentage>=60 ?

"👍 Good"

:

percentage>=40 ?

"🙂 Average"

:

"📚 Needs Improvement"

}

</h2>
</div>
     
)}
        <hr />
        {!isLearning && (
        <div
  className="card"
  style={{
    height: 350,
    padding: 20,
    marginTop: 30,
  }}
>
  <h2>📊 Score Analysis</h2>

  <ResponsiveContainer width="100%" height="90%">
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="question" />

      <YAxis domain={[0, 10]} />

      <Tooltip />

      <Bar
        dataKey="score"
      />
    </BarChart>
  </ResponsiveContainer>


</div>
 

)}
        <h2
  style={{
    marginBottom: "20px",
    color: "#1e3a8a",
  }}
>
  📋 Questions & Answers
</h2>

{attempt.answers.map((item, index) => (
  <div
    key={index}
    className="card"
    style={{
      padding: "25px",
      marginBottom: "25px",
      borderRadius: "15px",
      background: "#eff6ff",
      boxShadow: "0 8px 20px rgba(0,0,0,.08)",
      border: "1px solid #dbeafe",
    }}
  >
    <h2
      style={{
        color: "#2563eb",
        marginBottom: "20px",
      }}
    >
      ❓ Question {index + 1}
    </h2>

    <hr />

    <h4 style={{ color: "#2563eb" }}>
      📝 Question
    </h4>

    <p
      style={{
        lineHeight: "1.7",
        fontSize: "16px",
      }}
    >
      {item.question}
    </p>

    <hr />

   {!isLearning && (
  <>
    <h4>💬 Your Answer</h4>
    <p>{item.answer || "No Answer"}</p>
  </>
)}
 {!isLearning && (
  <>
    <p
      style={{
        lineHeight: "1.7",
        fontSize: "16px",
      }}
    >
      {item.answer || "No Answer"}
    </p>

    <hr />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h4>⭐ Score</h4>

      <span
        style={{
          padding: "8px 18px",
          borderRadius: "20px",
          fontWeight: "bold",
          color: "white",
          background:
            item.score >= 8
              ? "#16a34a"
              : item.score >= 5
              ? "#f59e0b"
              : "#dc2626",
        }}
      >
        {item.score}/10
      </span>
    </div>

    <hr />

    <h4 style={{ color: "#2563eb" }}>
      🤖 AI Feedback
    </h4>

    <div
      style={{
        background: "#eef6ff",
        padding: "15px",
        borderRadius: "10px",
        lineHeight: "1.7",
      }}
    >
      {item.feedback}
    </div>
</>
)}
    <hr />

    <h4 style={{ color: "#16a34a" }}>
      ✅ Ideal Answer
    </h4>

    <div
      style={{
        background: "#f0fdf4",
        padding: "15px",
        borderRadius: "10px",
        lineHeight: "1.8",
        whiteSpace: "pre-wrap",
      }}
    >
      {item.idealAnswer}
    </div>
  </div>
))}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <button
          className="btn btn-orange"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
 {!isLearning && (
  <>
         <button
         class="btn btn-purple"
  onClick={retakeSameQuestions}
  
>
  Retake Same Questions
</button>
<button
  onClick={retakeNewQuestions}
  class="btn btn-pink"
>
  Retake New Questions
</button>
</>
  )}
        </div>
      
      </div>
    
    </>
  );
}

export default Report;