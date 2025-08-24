import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * A bar chart component to visualize vulnerabilities by risk level.
 * @param {object} props The component props.
 * @param {Array<object>} props.data The data to display in the chart.
 * @returns {JSX.Element} The BarChart component.
 */
const VulnerabilityBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="High" stackId="a" fill="#ef4444" />
        <Bar dataKey="Medium" stackId="a" fill="#f97316" />
        <Bar dataKey="Low" stackId="a" fill="#facc15" />
        <Bar dataKey="Informational" stackId="a" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VulnerabilityBarChart;
