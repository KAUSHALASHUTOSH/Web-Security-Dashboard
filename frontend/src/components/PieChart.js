import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

/**
 * A pie chart component to visualize the distribution of vulnerabilities by severity.
 * @param {object} props The component props.
 * @param {Array<object>} props.data The data to display in the chart.
 * @returns {JSX.Element} The PieChart component.
 */
const VulnerabilityPieChart = ({ data }) => {
  const COLORS = ['#ef4444', '#f97316', '#facc15', '#3b82f6'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default VulnerabilityPieChart;
