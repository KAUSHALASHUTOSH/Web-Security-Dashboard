// api.js

// This is the new, hosted URL for your backend on Render.
// Your frontend will now send all API requests to this address.
const API_BASE_URL = 'https://web-security-dashboard1.onrender.com';

/**
 * Initiates a new security scan for a given URL.
 * @param {string} url The target URL to scan.
 * @returns {Promise<object>} A promise that resolves to the API response.
 */
export async function startScan(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error initiating scan:", error);
    throw error;
  }
}

/**
 * Fetches the current status and results of a specific scan.
 * @param {string} scanId The ID of the scan to check.
 * @returns {Promise<object>} A promise that resolves to the scan status and data.
 */
export async function getScanResults(scanId) {
  try {
    const response = await fetch(`${API_BASE_URL}/scan-results/${scanId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching scan status:", error);
    throw error;
  }
}

/**
 * Fetches a list of all historical scans.
 * @returns {Promise<object[]>} A promise that resolves to an array of scan objects.
 */
export async function getHistoricalScans() {
    try {
        const response = await fetch(`${API_BASE_URL}/historical-scans`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching historical scans:", error);
        throw error;
    }
}
