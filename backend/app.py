import os
import time
import uuid
import requests
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
# The fix: Explicitly allow all origins for all routes to handle CORS in a production environment
CORS(app, resources={r"/*": {"origins": "*"}})

# --- ZAP Configuration ---
ZAP_PROXY_URL = 'http://127.0.0.1:8080'
ZAP_API_KEY = os.environ.get('ZAP_API_KEY')
if not ZAP_API_KEY:
    print("WARNING: ZAP_API_KEY environment variable is not set. Using a placeholder.")
    ZAP_API_KEY = 'YOUR_API_KEY_GOES_HERE'

# --- MongoDB Database Connection ---
MONGO_URI = os.environ.get('MONGO_URI')
if not MONGO_URI:
    print("ERROR: MONGO_URI environment variable is not set. Database will not function.")
    client = None
else:
    try:
        client = MongoClient(MONGO_URI)
        db = client.web_security_dashboard
        scans_collection = db.scans
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        client = None

def zap_api_request(component, view, params=None):
    """A helper function to make requests to the ZAP API."""
    try:
        url = f"{ZAP_PROXY_URL}/JSON/{component}/action/{view}"
        full_params = {'apikey': ZAP_API_KEY}
        if params:
            full_params.update(params)
        
        response = requests.get(url, params=full_params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"ZAP API Request Failed: {e}")
        raise ConnectionError("Failed to connect to ZAP API. Is ZAP running in daemon mode?")

def run_zap_scan(scan_id, target_url):
    """Starts and monitors a full ZAP scan in a separate thread."""
    if client is None:
        return

    try:
        print(f"Thread started for scan: {scan_id}")
        
        zap_api_request('core', 'accessUrl', {'url': target_url})

        print("Starting ZAP spider scan...")
        spider_response = zap_api_request('spider', 'scan', {'url': target_url})
        spider_id = spider_response.get('scan')

        while True:
            status_response = zap_api_request('spider', 'status', {'scanId': spider_id})
            progress = int(status_response.get('status', '0'))
            scans_collection.update_one({'scan_id': scan_id}, {'$set': {'progress': progress / 2, 'status': 'Spidering...'}})
            if progress >= 100:
                break
            time.sleep(2)
        print("Spider scan completed.")

        print("Starting ZAP active scan...")
        ascan_response = zap_api_request('ascan', 'scan', {'url': target_url, 'recurse': 'true'})
        ascan_id = ascan_response.get('scan')
        
        while True:
            status_response = zap_api_request('ascan', 'status', {'scanId': ascan_id})
            progress = int(status_response.get('status', '0'))
            scans_collection.update_one({'scan_id': scan_id}, {'$set': {'progress': 50 + progress / 2, 'status': 'Scanning...'}})
            if progress >= 100:
                break
            time.sleep(5)
        print("Active scan completed.")

        alerts_response = requests.get(
            f"{ZAP_PROXY_URL}/JSON/core/view/alerts",
            params={'apikey': ZAP_API_KEY, 'baseurl': target_url}
        )
        alerts_response.raise_for_status()
        alerts = alerts_response.json().get('alerts', [])
        
        vulnerabilities = []
        for alert in alerts:
            vulnerabilities.append({
                'name': alert.get('alert'),
                'risk': alert.get('riskdesc').split(' ')[0],
                'url': alert.get('url'),
                'description': alert.get('description')
            })

        scans_collection.update_one(
            {'scan_id': scan_id},
            {'$set': {
                'status': 'Completed',
                'progress': 100,
                'vulnerabilities': vulnerabilities
            }}
        )
        print(f"Scan {scan_id} completed and results saved.")

    except Exception as e:
        scans_collection.update_one(
            {'scan_id': scan_id},
            {'$set': {
                'status': 'Failed',
                'progress': 100,
                'error': str(e)
            }}
        )
        print(f"Scan {scan_id} failed: {e}")

@app.route('/scan', methods=['POST'])
def start_scan():
    if not client:
        return jsonify({"error": "Database connection failed."}), 500

    data = request.get_json()
    target_url = data.get('url')
    if not target_url:
        return jsonify({"error": "URL not provided."}), 400

    scan_id = str(uuid.uuid4())
    scan_document = {
        'scan_id': scan_id,
        'url': target_url,
        'status': 'Starting...',
        'progress': 0,
        'vulnerabilities': [],
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }
    scans_collection.insert_one(scan_document)
    
    thread = threading.Thread(target=run_zap_scan, args=(scan_id, target_url))
    thread.daemon = True
    thread.start()

    return jsonify({"message": "Scan initiated.", "scan_id": scan_id}), 200

@app.route('/scan-results/<scan_id>', methods=['GET'])
def get_scan_results(scan_id):
    if not client:
        return jsonify({"error": "Database connection failed."}), 500
    
    scan = scans_collection.find_one({'scan_id': scan_id}, {'_id': 0})
    if not scan:
        return jsonify({"error": "Scan not found."}), 404
    
    return jsonify(scan), 200

@app.route('/historical-scans', methods=['GET'])
def get_historical_scans():
    if not client:
        return jsonify({"error": "Database connection failed."}), 500
    
    scans = list(scans_collection.find({}, {'_id': 0}).sort('timestamp', -1))
    return jsonify(scans), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
