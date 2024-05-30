from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore

import re
import json
import subprocess

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/')
def home():
    return "Welcome to the WRK Load Tester API!"

@app.route('/api/v1/run', methods=['POST'])
def run_wrk():
    data = request.get_json()
    url = data.get('url')
    url = url.strip().lower()

    if not (url.startswith("http://") or url.startswith("https://")):
        url = "http://" + url

    threads = data.get('threads', 2)
    connections = data.get('connections', 10)
    duration = data.get('duration', '10s')


    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        result = subprocess.run(
            ['wrk', '-t', str(threads), '-c', str(connections), '-d', str(duration), url],
            capture_output=True, text=True
        )
        # output = parse_test_output(result.stdout)
        output = result.stdout
        return jsonify({
            'output': output,
            # 'output_2': result.stdout
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def parse_test_output(output):
    # Regular expressions to extract the data
    url_pattern = re.compile(r'Running \d+s test @ (https?://\S+)')
    threads_pattern = re.compile(r'(\d+) threads')
    connections_pattern = re.compile(r'(\d+) connections')
    latency_pattern = re.compile(r'Latency\s+([\d.]+ms)\s+([\d.]+ms)\s+([\d.]+ms)\s+([\d.]+%)')
    req_sec_pattern = re.compile(r'Req/Sec\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+%)')
    requests_pattern = re.compile(r'(\d+) requests in ([\d.]+s), ([\d.]+KB) read')
    requests_per_sec_pattern = re.compile(r'Requests/sec:\s+([\d.]+)')
    transfer_sec_pattern = re.compile(r'Transfer/sec:\s+([\d.]+KB)')

    # Extract data using the patterns
    url_match = url_pattern.search(output)
    threads_match = threads_pattern.search(output)
    connections_match = connections_pattern.search(output)
    latency_match = latency_pattern.search(output)
    req_sec_match = req_sec_pattern.search(output)
    requests_match = requests_pattern.search(output)
    requests_per_sec_match = requests_per_sec_pattern.search(output)
    transfer_sec_match = transfer_sec_pattern.search(output)

    # Construct the JSON object
    result = {
        "url": url_match.group(1) if url_match else None,
        "threads": int(threads_match.group(1)) if threads_match else None,
        "connections": int(connections_match.group(1)) if connections_match else None,
        "latency": {
            "avg": latency_match.group(1),
            "stdev": latency_match.group(2),
            "max": latency_match.group(3),
            "percentPlusStdev": latency_match.group(4)
        } if latency_match else None,
        "reqPerSec": {
            "avg": req_sec_match.group(1),
            "stdev": req_sec_match.group(2),
            "max": req_sec_match.group(3),
            "percentPlusStdev": req_sec_match.group(4)
        } if req_sec_match else None,
        "totalRequests": int(requests_match.group(1)) if requests_match else None,
        "duration": requests_match.group(2) if requests_match else None,
        "dataRead": requests_match.group(3) if requests_match else None,
        "requestsPerSec": float(requests_per_sec_match.group(1)) if requests_per_sec_match else None,
        "transferPerSec": transfer_sec_match.group(1) if transfer_sec_match else None
    }

    # Convert the result to JSON
    result_json = json.dumps(result, indent=2)
    return result_json





if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
