
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ScoreChart from "../components/ScoreChart";


function Dashboard() {
    const navigate = useNavigate(); 
  const [form, setForm] = useState({
    role: "",
    company: "",
    experience: "",
    topic: "General",
    difficulty: "Medium",
    count: 5,
    purpose: "Interview",
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const startInterview = async () => {
  try {
    setLoading(true);

    const userId = localStorage.getItem("userId");

    if (!form.role || !form.company) {
      alert("Role and Company required");
      return;
    }

    // 1. CREATE INTERVIEW
    const createRes = await axios.post(
      "https://ai-interview-coach-backend-q6ja.onrender.com/api/interview/create",
      {
        userId,
        ...form,
      }
    );

    const interviewId = createRes.data.interviewId;

    // 2. GENERATE QUESTIONS
    const genRes = await axios.post(
      "https://ai-interview-coach-backend-q6ja.onrender.com/api/interview/generate",
      form
    );

   let questions = [];
let learningData = [];

if (form.purpose === "Learning") {
  learningData = genRes.data.learningData;
  questions = learningData.map(item => item.question);
} else {
  questions = genRes.data.questions;
}

    if (!questions || questions.length === 0) {
      alert("No questions generated");
      return;
    }

    // 3. MOVE TO INTERVIEW PAGE
    navigate("/interview", {
     state: {
  interviewId,
  questions,
  learningData,
  form,
},
    });

  } catch (err) {
    console.log(err);
    alert("Error starting interview");
  } finally {
    setLoading(false);
  }
};
const calculateAverageScore = (attempts = []) => {
  if (attempts.length === 0) return 0;

  const total = attempts.reduce(
    (sum, a) => sum + a.totalScore,
    0
  );

  return Math.round(total / attempts.length);
};
const fetchHistory = async () => {
  try {
    const userId = localStorage.getItem("userId");

    const res = await axios.get(
      `https://ai-interview-coach-backend-q6ja.onrender.com/api/interview/history/${userId}`
    );

    setHistory(res.data.interviews || []);
  } catch (err) {
    console.log(err);
  }
};
useEffect(() => {
  fetchHistory();
}, []);
const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}m ${secs}s`;
};

const deleteInterview = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this interview?"
  );

  if (!confirmDelete) return;

  try {
    await axios.delete(
      `https://ai-interview-coach-backend-q6ja.onrender.com/api/interview/delete/${id}`
    );

    alert("Interview deleted successfully");

    fetchHistory(); // Refresh history
  } catch (err) {
    console.log(err);
    alert("Unable to delete interview");
  }
};
  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          background: "#05d6e4",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,.1)",
        }}
      >
        <h1>
👋 Welcome back
</h1>

<p>
Practice today. Improve tomorrow 🚀
</p>
        <h1 style={{ marginBottom: "25px" }}>
          Start New Interview
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <input
            name="role"
            placeholder="Role (Example: SDE-1)"
            value={form.role}
            onChange={handleChange}
          />

          <input
            name="company"
            placeholder="Company (Example: Amazon)"
            value={form.company}
            onChange={handleChange}
          />

          <input
            name="experience"
            placeholder="Experience (Example: Fresher)"
            value={form.experience}
            onChange={handleChange}
          />

          <select
            name="topic"
            value={form.topic}
            onChange={handleChange}
          >
            <option>General</option>
            <option>DSA</option>
            <option>OOPS</option>
            <option>DBMS</option>
            <option>OS</option>
            <option>CN</option>
            <option>HR</option>
            <option>Leadership Principles</option>
            <option>System Design</option>
          </select>

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="number"
            name="count"
            min="1"
            max="20"
            value={form.count}
            onChange={handleChange}
          />

          <select
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
          >
            <option value="Interview">
              Interview Mode
            </option>

            <option value="Learning">
              Reading / Learning Mode
            </option>
          </select>
        </div>
        <hr></hr>
   <div>
   <button class="btn btn-purple "
  onClick={startInterview}
  disabled={loading}
  
>
  {loading ? "Generating..." : "Generate Interview"}
</button>
</div>
        <hr style={{ margin: "40px 0" }} />

       <h2>Interview History</h2>

{history.length === 0 ? (
  <p style={{ color: "#666" }}>No interviews yet.</p>
) : (
  history.map((item) => (
    <div key={item._id} className="card">
     <h3>{item.role}</h3>

<div style={{marginBottom:10}}>

<span className="badge">
🏢 {item.company}
</span>

<span className="badge">
📘 {item.topic}
</span>

<span className="badge">
🎯 {item.difficulty}
</span>

<span className="badge">
{item.purpose==="Learning" ? "📖 Learning" : "🎤 Interview"}
</span>

</div>

<p><b>Experience:</b> {item.experience}</p>

{item.purpose === "Interview" && (
  <>
    <p>
      <b>Attempts:</b> {item.attempts.length}
    </p>

    {item.attempts.length > 0 && (
      <ScoreChart attempts={item.attempts} />
    )}

    {item.attempts.length > 0 && (
      <p>
        <b>Latest Score:</b>{" "}
        {item.attempts[item.attempts.length - 1].totalScore}
        /
        {item.attempts[item.attempts.length - 1].answers.length * 10}
      </p>
    )}

    <p>
      <b>Average Score:</b>{" "}
      {calculateAverageScore(item.attempts)}
    </p>
  </>
)}

<p>
  <b>Date:</b>{" "}
  {new Date(item.createdAt).toLocaleString()}
</p>

<h4 style={{ marginTop: "15px" }}>Attempts</h4>

{item.attempts.length === 0 ? (
  <p>No attempts yet.</p>
) : (
  item.attempts.map((attempt) => (
    <div
      key={attempt.attemptNumber}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        marginTop: "12px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
      }}
    >
      <div>
  {attempt.isLearning ? (
    <>
      <h4 style={{ margin: 0 }}>
        📖 Learning Session
      </h4>

      <p style={{ margin: "6px 0" }}>
        ✅ Completed Successfully
      </p>

      <p style={{ margin: "6px 0" }}>
        📅 {new Date(attempt.completedAt).toLocaleString()}
      </p>
    </>
  ) : (
    <>
      <h4 style={{ margin: 0 }}>
        Attempt #{attempt.attemptNumber}
      </h4>

      <p style={{ margin: "6px 0" }}>
        ⭐ Score: {attempt.totalScore}/{attempt.answers.length * 10}
      </p>

      <p style={{ margin: "6px 0" }}>
        ⏱ Time: {formatDuration(attempt.duration)}
      </p>

      <p style={{ margin: "6px 0" }}>
        📅 {new Date(attempt.completedAt).toLocaleString()}
      </p>
    </>
  )}
</div>

      <button
        className="btn btn-teal"
        onClick={() =>
          navigate("/report", {
            state: {
              interview: item,
              attempt: attempt,
            },
          })
        }
      >
        View Report
      </button>
      <button
  className="btn btn-red"
  onClick={() => deleteInterview(item._id)}
>
  🗑 Delete
</button>
    </div>
    
  ))
)}
    </div>
  ))
)}
      </div>
    </>
  );
}

export default Dashboard;