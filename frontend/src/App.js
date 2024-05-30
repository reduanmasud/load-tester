import React, { useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [url, setUrl] = useState('https://google.com');
  const [threads, setThreads] = useState(2);
  const [connections, setConnections] = useState(10);
  const [duration, setDuration] = useState('30');
  const [output, setOutput] = useState('');
  const [runningTest, setRunningTest] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOutput('');
    setRunningTest(true);
    setProgress(0);

    const durationMS = parseFloat(duration) * 1000 + 500;
    const interval = setInterval(()=> {
      setProgress((prev) => {
        const newProgress = prev + 100 / (durationMS / 100);
        if(newProgress >= 100 )
          {
            clearInterval(interval);
            return 99;
          }
          return newProgress;
      })
    }, 100);

    await new Promise((resolve) => setTimeout(resolve, durationMS));

    const response = await fetch(process.env.API_ENDPOINT || 'http://127.0.0.1:5000/api/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, threads, connections, duration }),
    });
    const data = await response.json();
    console.log(data);
    setOutput(data);
    if(data) setRunningTest(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h1 className="text-center">Website Load Tester</h1>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3 row">
                  <div className='col-sm-3'>
                    <label className='col-form-label'>Website URL </label>
                  </div>
                  <div className='col-sm-9'>
                    <input type="text" className="form-control" value={url} onChange={(e) => setUrl(e.target.value)} required />
                  </div>
                </div>
                <div className="mb-3 row">
                  <div className='col-sm-3'>
                    <label className='col-form-label'>Threads number </label>
                  </div>
                  <div className='col-sm-9'>
                    <input type="number" className="form-control" value={threads} onChange={(e) => setThreads(e.target.value)} />
                  </div>
                </div>
                <div className="mb-3 row align-items-start">
                  <div className='col-sm-3'>
                    <label className='col-form-label' style={{paddingTop:'0px'}}>Connections number </label>
                  </div>
                  <div className='col-sm-9'>
                    <input type="number" className="form-control" value={connections} onChange={(e) => setConnections(e.target.value)} />
                  </div>
                </div>
                <div className="mb-3 row">
                  <div className='col-sm-3'>
                    <label className='col-form-label'>Duration </label>
                  </div>
                  <div className='col-sm-9'>
                    <input type="range" className="form-range" style={{paddingTop:'15px'}} value={duration} min={1} max={60} step={1} onChange={(e) => setDuration(e.target.value)} />
                    <span>{duration}s</span>
                  </div>

                  {/* <label className="form-label">
                    Duration:
                    <input type="text" className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </label> */}
                </div>
                <button type="submit" className="btn btn-primary" disabled={runningTest} >{runningTest ? 'Running Test': 'Run Test'}</button>
              </form>
            </div>
            {runningTest && (
            <div className="mt-3">
              <div className="progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

            {output && (
              <div className="card-footer">
                <h2>Output:</h2>
                <pre>{output.output}</pre>
                {/* <h2>Output 2</h2>
                <pre>{output.output_2}</pre> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


