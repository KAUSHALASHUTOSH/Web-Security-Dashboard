import React from 'react';

/**
 * A reusable card component to display a single scan report.
 * @param {object} props The component props.
 * @param {object} props.report The report object.
 * @param {function} props.onClick The function to call when the card is clicked.
 * @returns {JSX.Element} The ReportCard component.
 */
const ReportCard = ({ report, onClick }) => {
    // Use optional chaining (?) to safely access properties
    const totalVulnerabilities = report.vulnerabilities?.length || 0;

    // Determine the color based on scan status for visual feedback
    const statusColor = report.status === 'Completed' ? 'bg-green-500' :
        report.status === 'Running' ? 'bg-yellow-500' :
            'bg-gray-400';

    return (
        <div
            className="bg-white rounded-xl shadow-lg p-6 m-4 w-full md:w-1/3 lg:w-1/4 transform hover:scale-105 transition-transform duration-300 cursor-pointer hover:shadow-xl"
            onClick={onClick} // Added onClick handler
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{report.url}</h3>
                <span className={`inline-block h-4 w-4 rounded-full ${statusColor}`}></span>
            </div>
            <p className="text-gray-600 mt-2">Status: <span className="font-semibold">{report.status}</span></p>
            <p className="text-gray-600">Total Vulnerabilities: <span className="font-semibold">{totalVulnerabilities}</span></p>
            <p className="text-sm text-gray-500 mt-2">
                Last Scanned: {new Date(report.timestamp).toLocaleString()}
            </p>
        </div>
    );
};

export default ReportCard;
