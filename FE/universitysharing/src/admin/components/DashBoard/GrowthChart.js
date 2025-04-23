import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Tháng 1", value: 3000 },
  { month: "Tháng 2", value: 5000 },
  { month: "Tháng 3", value: 4000 },
  { month: "Tháng 4", value: 6500 },
  { month: "Tháng 5", value: 6500 },
  { month: "Tháng 6", value: 6500 },
  { month: "Tháng 7", value: 6500 },
  { month: "Tháng 8", value: 600 },
  { month: "Tháng 9", value: 6500 },
  { month: "Tháng 10", value: 6500 },
  { month: "Tháng 11", value: 500 },
  { month: "Tháng 12", value: 6500 },
];

const GrowthChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);
export default GrowthChart;
