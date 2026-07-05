import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ScoreChart({ attempts }) {
  const data = attempts.map((attempt) => ({
  attempt: `Attempt ${attempt.attemptNumber}`,
  score: attempt.totalScore,
  time: attempt.duration,
}));

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        marginTop: 20,
      }}
    >
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="attempt" />

          <YAxis />

          <Tooltip
  formatter={(value, name) => [
    value,
    name === "score" ? "Score" : name,
  ]}
/>

          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreChart;