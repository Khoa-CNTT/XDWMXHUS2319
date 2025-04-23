import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const UserPieChart = () => {
  // Dữ liệu ví dụ
  const data = [
    { name: "Người dùng uy tín", value: 60 },
    { name: "Người dùng vi phạm", value: 40 },
  ];

  // Màu sắc của các phần trong pie chart
  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default UserPieChart;
