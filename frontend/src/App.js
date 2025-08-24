import React, { useState, useEffect } from 'react';
import { getHistoricalScans, startScan, getScanResults } from './services/api';
import VulnerabilityTable from './components/vulnerabilityTable';
import VulnerabilityBarChart from './components/BarChart';
import VulnerabilityPieChart from './components/PieChart';
import ReportCard from './components/ReportCard';
import VulnerabilityDetails from './components/VulnerabilityDetails';

/**
 * Main application component for the Web Security Dashboard.
 * @returns {JSX.Element} The App component.
 */
const App = () => {
  const [historicalScans, setHistoricalScans] = useState([]);
  const [currentScanUrl, setCurrentScanUrl] = useState('');
  const [currentScan, setCurrentScan] = useState(null);
  const [selectedHistoricalScan, setSelectedHistoricalScan] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  // Data for charts
  const chartData = vulnerabilities.reduce((acc, vuln) => {
    acc[vuln.risk] = (acc[vuln.risk] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(chartData).map(key => ({
    name: key,
    [key]: chartData[key],
  }));
  
  const pieChartData = Object.keys(chartData).map(key => ({
    name: key,
    value: chartData[key],
  }));

  // Fetches initial data on component mount
  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const scans = await getHistoricalScans();
      setHistoricalScans(scans);
    } catch (err) {
      setError("Failed to fetch historical scan data.");
      console.error(err);
    }
  };

  const handleStartScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentScan(null);
    setVulnerabilities([]);
    setSelectedHistoricalScan(null);
    setSelectedVulnerability(null);

    try {
      const response = await startScan(currentScanUrl);
      const scanId = response.scan_id;
      setCurrentScan({ url: currentScanUrl, status: 'Starting...', vulnerabilities: [], timestamp: new Date() });
      
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await getScanResults(scanId);
          if (statusResponse.status === 'Completed') {
            clearInterval(pollInterval);
            setCurrentScan({ ...currentScan, status: 'Completed' });
            setVulnerabilities(statusResponse.vulnerabilities);
            setLoading(false);
            fetchHistoricalData();
          } else if (statusResponse.status === 'Failed') {
            clearInterval(pollInterval);
            setLoading(false);
            setError(`Scan failed: ${statusResponse.error || 'Unknown error'}`);
          } else {
            setScanProgress(statusResponse.progress);
            setCurrentScan({ ...currentScan, status: statusResponse.status });
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
          clearInterval(pollInterval);
          setLoading(false);
          setError("Scan failed to complete. Check ZAP and your backend connection.");
        }
      }, 2000); // Poll every 2 seconds for better feedback

    } catch (err) {
      setLoading(false);
      setError("Failed to start a new scan. Please check your backend connection and ZAP daemon.");
      console.error(err);
    }
  };

  const handleHistoricalScanClick = (scan) => {
    setSelectedHistoricalScan(scan);
    setVulnerabilities(scan.vulnerabilities);
    setCurrentScan(null);
    setSelectedVulnerability(null);
  };

  const handleSelectVulnerability = (vuln) => {
    setSelectedVulnerability(vuln);
  };

  const handleCloseDetails = () => {
    setSelectedVulnerability(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
            Web Application Security Dashboard
          </h1>
          <p className="text-center text-gray-500">Monitor and analyze vulnerabilities in your web applications.</p>
        </header>

        {/* Scan Input Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Start a New Scan</h2>
          <form onSubmit={handleStartScan} className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              placeholder="Enter website URL (e.g., http://testphp.vulnweb.com)"
              className="flex-grow border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentScanUrl}
              onChange={(e) => setCurrentScanUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Scanning...' : 'Start Scan'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </section>
        
        {/* Current Scan Section */}
        {currentScan && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Scan: {currentScan.url}</h2>
            <ReportCard report={currentScan} />
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
                <p className="text-lg font-semibold text-gray-800">{currentScan.status} ({scanProgress}%)</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                {vulnerabilities.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Vulnerabilities by Risk Level (Pie Chart)</h3>
                        <VulnerabilityPieChart data={pieChartData} />
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Vulnerabilities by Risk Level (Bar Chart)</h3>
                        <VulnerabilityBarChart data={barChartData} />
                      </div>
                    </div>
                    <VulnerabilityTable vulnerabilities={vulnerabilities} onSelectVulnerability={handleSelectVulnerability} />
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 mt-4 text-center">
                    <p>No vulnerabilities found for this scan.</p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Selected Historical Scan Details */}
        {selectedHistoricalScan && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Details for Historical Scan: {selectedHistoricalScan.url}</h2>
            {vulnerabilities.length > 0 ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Vulnerabilities by Risk Level (Pie Chart)</h3>
                        <VulnerabilityPieChart data={pieChartData} />
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Vulnerabilities by Risk Level (Bar Chart)</h3>
                        <VulnerabilityBarChart data={barChartData} />
                    </div>
                </div>
                <VulnerabilityTable vulnerabilities={vulnerabilities} onSelectVulnerability={handleSelectVulnerability} />
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 mt-4 text-center">
                    <p>No vulnerabilities found for this historical scan.</p>
                </div>
            )}
          </section>
        )}

        {/* Historical Scans Section */}
        {historicalScans.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Historical Scans</h2>
            <div className="flex flex-wrap -m-4">
              {historicalScans.map((scan, index) => (
                <ReportCard key={index} report={scan} onClick={() => handleHistoricalScanClick(scan)} />
              ))}
            </div>
          </section>
        )}

        {/* The Vulnerability Details Modal/Box */}
        <VulnerabilityDetails 
          vulnerability={selectedVulnerability} 
          onClose={handleCloseDetails} 
        />
      </div>
    </div>
  );
};

export default App;
